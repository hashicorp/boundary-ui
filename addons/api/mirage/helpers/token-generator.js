export default function(scopeAttrs, server) {
   console.log('in token generatorrr', scopeAttrs, server)
    const user = server.schema.users.create({id: 'user-6'});
     const newSession = server.schema.sessions.create({
        //scope,
        userId: user?.attrs?.id,
        created_time: new Date().toISOString(),
      });
      console.log(user, newSession, 'FINN')
      return {
          attributes: {
            scope: scopeAttrs,
            id: 'token123',
            token: 'thetokenstring',
            account_id: '1',
            user_id: newSession.userId,
            auth_method_id: 'authmethod123',
            created_time: '',
            updated_time: '',
            last_used_time: '',
            expiration_time: '',
          },
        }
    }
    
    
    