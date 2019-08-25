const _ = require('lodash');

module.exports = {
  friendlyName: 'Register with profiling',

  description: '',

  inputs: {
    name: {
      description: 'User name',
      type: 'string',
      required: true
    },
    email: {
      description: 'User email',
      type: 'string',
      required: true
    },
    savingAns: {
      description: 'User savings amount answer',
      type: 'number',
      required: true
    },
    loanAns: {
      description: 'User loan amount answer',
      type: 'number',
      required: true
    }
  },

  exits: {
    badRequest: {
      description: 'Wrong request',
      statusCode: 400
    }
  },

  fn: async function(inputs, exits) {
    const userProfilingRes = await sails.helpers.calculateUserProfileScore(
      inputs.savingAns,
      inputs.loanAns
    );

    if (userProfilingRes.statusCode === 204) {
      return exits.badRequest();
    }

    Users.findOrCreate(
      { email: inputs.email },
      {
        name: inputs.name,
        email: inputs.email,
        profileScore: userProfilingRes.totalScore
      }
    ).exec(async (err, user, wasCreated) => {
      let updateOrCreateMessage;

      if (err) {
        return this.res.serverError(err);
      }

      if (wasCreated) {
        updateOrCreateMessage = 'Created user, ' + user.name;
      } else {
        await Users.update({ email: user.email }).set({
          profileScore: userProfilingRes.totalScore
        });

        updateOrCreateMessage = 'Updated ' + user.name + ' profile score';
      }

      return exits.success({
        savings: userProfilingRes.savings,
        loan: userProfilingRes.loan,
        totalScore: userProfilingRes.totalScore,
        profile: userProfilingRes.profile,
        message: updateOrCreateMessage
      });
    });
  }
};
