import { readFileSync } from 'fs';

// eslint-disable-next-line no-undef
let reportPath = process.env.EMBER_A11Y_REPORT_FILE;
if (!reportPath) {
  throw new Error('EMBER_A11Y_REPORT_FILE environment variable is required');
}
const reportContents = JSON.parse(readFileSync(reportPath).toString());

function getKeyNameFromProperty(property) {
  // property key can be of type `Identifier`: ({ key: "hello" }) or `StringLiteral` where the key is quoted: ({ "key": "hello" })
  // and the path for determining the key's name is different depending on if its an `Identifier` or `StringLiteral`
  const nameForIdentifier = property.key.name;
  const nameForStringLiteral = property.key.value;

  return nameForIdentifier ?? nameForStringLiteral;
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const f = j(file.source);
  const { statement } = j.template;

  const tests = f.find(j.CallExpression, {
    callee: {
      name: 'test',
    },
  });

  function closestModules(test) {
    const modules = [];
    let parent = test.closest(j.CallExpression, {
      callee: {
        name: 'module',
      },
    });

    while (parent.length > 0) {
      modules.unshift(parent.get().value.arguments[0].value);

      parent = parent.closest(j.CallExpression, {
        callee: {
          name: 'module',
        },
      });
    }

    return modules;
  }

  tests.forEach((_, i) => {
    const test = tests.at(i);
    const testName = test.get().value.arguments[0].value;
    // the ember-a11y-testing testem middleware reporter reports the modules as a single string
    // with nested modules separated by " > "
    const moduleName = closestModules(test).join(' > ');

    const violations = reportContents
      .filter((testEntry) => {
        // search the report for a matching module name and test name
        return (
          testEntry.moduleName === moduleName && testEntry.testName === testName
        );
      })
      .map((testEntry) => testEntry.violations)
      .flat();
    const violationNames = new Set(
      violations
        .map((v) => {
          return v.id;
        })
        .filter(Boolean),
    );

    // early return, only when there are violations do we do further processing on the file
    if (violations.length === 0) {
      return;
    }

    const existingEmberA11yImport = f.find(j.ImportDeclaration, {
      source: {
        value: 'ember-a11y-testing/test-support',
      },
    });

    const runOptionsEmberA11yImport = statement`import { setRunOptions } from 'ember-a11y-testing/test-support'`;
    if (existingEmberA11yImport.length > 0) {
      const importNode = existingEmberA11yImport.get();

      const hasExistingSetRunOptionImport = importNode.value.specifiers.some(specifier => specifier.imported.name === 'setRunOptions');

      importNode.value.specifiers = [
        ...importNode.value.specifiers,
        ...(hasExistingSetRunOptionImport ? [] : runOptionsEmberA11yImport.specifiers),
      ];
    } else {
      f.find(j.ImportDeclaration).at(-1).insertAfter(runOptionsEmberA11yImport);
    }

    let setRunOptions = test.find(j.CallExpression, {
      callee: {
        name: 'setRunOptions',
      },
    });

    let setRunOptionsArgs = [];
    let setRunOptionsRules = [];
    const alreadyIgnoredRules = new Set();
    if (setRunOptions.length > 0) {
      // filter out the rules property from args so that it can be reconstructed
      // with rules merged
      setRunOptionsArgs = setRunOptions
        .get()
        .value.arguments[0].properties.filter((property) => {
          return getKeyNameFromProperty(property) !== 'rules';
        });

      // get the rules from within setRunOptions
      setRunOptionsRules = setRunOptions
        .get()
        .value.arguments[0].properties.find((property) => {
          return getKeyNameFromProperty(property) === 'rules';
        });

      if (setRunOptionsRules) {
        setRunOptionsRules.value.properties.forEach((rule) => {
          const ruleAlreadyIgnored = rule.value.properties.some((property) => {
            return (
              getKeyNameFromProperty(property) === 'enabled' && property.value.value === false
            );
          });

          // track rules that are already ignored so that they aren't updated (preserves existing comment and timestamp)
          if (ruleAlreadyIgnored) {
            alreadyIgnoredRules.add(rule.key.value);
          }
        });

        // if rules currently existing within `setRunOptions` then filter out any
        // rules that currently have violations those will be handled separately
        setRunOptionsRules = setRunOptionsRules.value.properties.filter(
          (rule) => {
            const ruleName = rule.key.value;
            return (
              !violationNames.has(ruleName) || alreadyIgnoredRules.has(ruleName)
            );
          },
        );
      } else {
        setRunOptionsRules = [];
      }
    }

    // this represents the actual injection of properties to ignore based on
    // violations from the report, this amounts to an array of property definitions:
    // ruleName: { enabled: false }
    const injectedViolationsRunOptionsRules = violations
      .filter((violation) => !alreadyIgnoredRules.has(violation.id))
      .map((violation) => {
        const enabledFalseProperty = j.objectProperty(
          j.identifier('enabled'),
          j.booleanLiteral(false),
        );

        enabledFalseProperty.comments = [
          j.commentLine(
            ` [ember-a11y-ignore]: axe rule "${violation.id}" automatically ignored on ${new Date().toISOString()}`,
            true,
            false,
          ),
        ];

        return j.objectProperty(
          j.identifier(`"${violation.id}"`),
          j.objectExpression([enabledFalseProperty]),
        );
      });

    const injectedSetRunOptions = j.callExpression(
      j.identifier('setRunOptions'),
      [
        j.objectExpression([
          ...setRunOptionsArgs,
          j.objectProperty(
            j.identifier('rules'),
            // splat the existing rules, along with the violation rules
            j.objectExpression([
              ...setRunOptionsRules,
              ...injectedViolationsRunOptionsRules,
            ]),
          ),
        ]),
      ],
    );

    if (setRunOptions.length > 0) {
      setRunOptions.replaceWith(function () {
        return injectedSetRunOptions;
      });
    } else {
      test
        .get()
        .value.arguments[1].body.body.unshift(
          j.expressionStatement(injectedSetRunOptions),
        );
    }
  });

  const code = f.toSource();

  // the codemod will insert a newline between existing import statements,
  // this regex removes the extra new line
  //
  return code.replace(/(?<newline>\n)(import .*ember-a11y-testing\/test-support.*)/g, "$2");
}
