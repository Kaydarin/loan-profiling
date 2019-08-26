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
    /*
      -- Calculate user profile score
    */
    const userProfilingRes = await sails.helpers.calculateUserProfileScore(
      inputs.savingAns,
      inputs.loanAns
    );

    // Return error if calculation fails
    // due to mismatch input data
    if (userProfilingRes.statusCode === 204) {
      return exits.badRequest();
    }

    /*
      -- Create user along with their score or,
      -- update user score
    */
    Users.findOrCreate(
      { email: inputs.email },
      {
        name: inputs.name,
        email: inputs.email,
        profileScore: userProfilingRes.totalScore
      }
    ).exec(async (err, user, wasCreated) => {
      let updateOrCreateMessage;

      // If something wrong with the creation,
      // return error
      if (err) {
        return this.res.serverError(err);
      }

      // If successfully created, return success message
      if (wasCreated) {
        updateOrCreateMessage = 'Created user, ' + user.name;
      } else {
        await Users.update({ email: user.email }).set({
          profileScore: userProfilingRes.totalScore
        });

        // If successfully created, return success message
        updateOrCreateMessage = 'Updated ' + user.name + ' profile score';
      }

      // Return success response
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
