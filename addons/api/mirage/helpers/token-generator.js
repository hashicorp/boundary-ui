export default function (scopeAttrs, server, authId) {
  let newSesssion;
  server.schema.scopes.where({ type: 'project' }).models.forEach((scope) => {
    const targetId = server.createList(
      'target',
      1,
      { scope },
      'withAssociations'
    )[0];
    let id = 1;
    newSesssion = server.schema.sessions.create({
      scope,
      target_id: targetId?.id,
      id: `session-id-${id}`,
      type: 'tcp',
      userId: 'authenticateduser',
      created_time: new Date().toISOString(),
    });
  });
  return {
    attributes: {
      scope: scopeAttrs,
      id: 'token123',
      token: 'thetokenstring',
      account_id: '1',
      user_id: newSesssion?.userId,
      auth_method_id: authId,
      created_time: '',
      updated_time: '',
      last_used_time: '',
      expiration_time: '',
    },
  };
}
