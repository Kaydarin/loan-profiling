const _ = require('lodash');

module.exports = {
  friendlyName: 'Calculate user profile score',

  description: '',

  inputs: {
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

  exits: {},

  fn: async function(inputs, exits) {
    /*
      -- Find related questions along with its answers
    */
    const savingsCollAns = await Questions.find({ id: 1 }).populate('answers');
    const loanCollAns = await Questions.find({ id: 2 }).populate('answers');

    let savings = _.head(savingsCollAns).answers;
    let loan = _.head(loanCollAns).answers;

    /*
      -- Map answers to score
    */
    _.map(savings, function(data) {
      if (data.name === '0' || data.name === '2000') {
        _.assign(data, { score: 1 });
      } else if (data.name === '4000') {
        _.assign(data, { score: 2 });
      } else if (data.name === '6000') {
        _.assign(data, { score: 3 });
      } else if (data.name === '8000') {
        _.assign(data, { score: 4 });
      } else if (data.name === '10000') {
        _.assign(data, { score: 5 });
      }
    });

    _.map(loan, function(data) {
      if (data.name === '0' || data.name === '2000') {
        _.assign(data, { score: 5 });
      } else if (data.name === '4000') {
        _.assign(data, { score: 4 });
      } else if (data.name === '6000') {
        _.assign(data, { score: 3 });
      } else if (data.name === '8000') {
        _.assign(data, { score: 2 });
      } else if (data.name === '10000') {
        _.assign(data, { score: 1 });
      }
    });

    /*
      -- Get user answers along with the designated scores
    */
    const userSavings = _.find(savings, {
      name: inputs.savingAns.toString()
    });

    const userLoan = _.find(loan, {
      name: inputs.loanAns.toString()
    });

    // If there's no matched answers in either one of them (as in user alter in front-end side),
    // return partial error
    if (userSavings === undefined && userLoan === undefined) {
      return exits.success({
        statusCode: 204,
        description:
          'Unable to profiling user due to unmatch input data with stored data'
      });
    }

    /*
      -- Calculate total user score
    */
    const totalScore = userSavings.score + userLoan.score;

    let profile;

    // Map user score to profile type
    if (totalScore >= 8) {
      profile = 'A';
    } else if (totalScore >= 6) {
      profile = 'B';
    } else if (totalScore >= 4) {
      profile = 'C';
    } else {
      profile = 'D';
    }

    // Return success response
    return exits.success({
      statusCode: 200,
      savings: userSavings.name,
      loan: userLoan.name,
      totalScore: totalScore,
      profile: profile
    });
  }
};
