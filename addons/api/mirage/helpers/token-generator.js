export default function (scopeAttrs, server, authId) {
  const user = server.schema.users.find('authenticateduser');
  return {
    attributes: {
      scope: scopeAttrs,
      id: 'token123',
      token: 'thetokenstring',
      account_id: '1',
      user_id: user?.id,
      auth_method_id: authId,
      created_time: '',
      updated_time: '',
      last_used_time: '',
      expiration_time: '',
    },
  };
}
