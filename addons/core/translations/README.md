# Translations

Translations are used to keep template, form, and component files free of raw strings and create a single source of truth for text used throughout the repository.

Examples:

`{{t 'states.' message.type}}`

`{{t (concat "errors." this.messageCode ".description")}}`

### Actions
Action translations are reserved for actions a user can trigger.

### Errors
Translations that are for varying error titles and descriptions.

### Form
Translations for label and description text required for form fields.

### Notifications
Translations for notification messages.

### Resources
Translations with direction relation to different resources (e.g. accout, org, host).

### States
Translations for text related to different states data could be in (e.g. active, inactive, error).

### Root Translations
Translations for titles, descriptions, and translations that do not fit into other translation files.