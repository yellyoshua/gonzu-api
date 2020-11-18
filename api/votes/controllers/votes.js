'use strict';
const _ = require('underscore');
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

function parseDoubleArrToObjArr(arr) {
  const doubleArr = [...arr];
  var arrContainChilds = Array.isArray(doubleArr) ? Array.isArray(doubleArr[0]) : false;
  if (arrContainChilds) {
    const arrFields = doubleArr.shift();
    return doubleArr.map((arrItem, index) => {
      let obj = {};

      arrFields.forEach((field, index) => {
        obj[field] = arrItem[index];
      });

      return { ...obj, id: index };
    });
  }
  return [];
}

function groupAndCount(list) {
  return _.chain(list)
    .flatten()
    .reduce(function (counts, word) {
      counts[word] = (counts[word] || 0) + 1;
      return counts;
    }, {})
    .value();
}

module.exports = {
  async votesGeneralStats(ctx) {
    const { election_id } = ctx.params;
    const entityElection = await strapi.services.elections.findOne({ id: election_id });
    const entityVotes = await strapi.services.votes.find({ election: election_id });

    const votes = entityVotes.map(entity => sanitizeEntity(entity, { model: strapi.models.votes }));
    const election = sanitizeEntity(entityElection, { model: strapi.models.elections });

    if (election) {
      const tags = election.tags;
      const theElection = _.omit({ ...election }, ['campaigns', 'voters', 'tags']);
      const campaigns = _.indexBy(parseDoubleArrToObjArr(election.campaigns) || [], 'slug');
      const total_votes = votes.length;
      const parsed_votes = votes.map(v => _.pick(v, 'campaign_slug', 'voter', 'first_auth', 'second_auth'));
      const count_per_tag = _.mapObject(election.voters.data, function (voters = []) {
        return voters.length;
      });
      let votes_group = { count_by_tag: {}, count_by_campaign: {} };

      votes_group.count_by_tag = _.mapObject(
        parsed_votes.reduce(function (total, obj) {
          let key = _.keys(obj.voter)[0];
          if (!total[key]) {
            total[key] = [];
          }
          total[key].push({ ...obj.voter[key], campaign: obj.campaign_slug });
          return total;
        }, {}),
        function (votes = []) {
          return votes.length;
        }
      );

      votes_group.count_by_campaign = _.mapObject(
        parsed_votes.reduce(function (total, obj) {
          let key = obj.campaign_slug;
          if (!total[key]) {
            total[key] = [];
          }
          total[key].push({ ...obj.voter, campaign: obj.campaign_slug });
          return total;
        }, {}),
        function (votes = []) {
          return votes.length;
        }
      );

      return { ...theElection, tags, campaigns, count_per_tag, total_votes, votes_group };
    }
    return null;
  },
  async statsPerTag(ctx) {
    const { election_id } = ctx.params;
    const entityElection = await strapi.services.elections.findOne({ id: election_id });
    const entityVotes = await strapi.services.votes.find({ election: election_id });

    const votes = entityVotes.map(entity => sanitizeEntity(entity, { model: strapi.models.votes }));
    const election = sanitizeEntity(entityElection, { model: strapi.models.elections });

    if (election) {
      const tags = election.tags;
      const theElection = _.omit({ ...election }, ['campaigns', 'voters', 'tags']);
      const campaigns = _.indexBy(parseDoubleArrToObjArr(election.campaigns) || [], 'slug');
      const parsed_votes = votes.map(v => _.pick(v, 'campaign_slug', 'voter', 'first_auth', 'second_auth'));
      let votes_group = { group_by_tag: {}, group_by_campaign: {} };

      votes_group.group_by_tag = parsed_votes.reduce(function (total, obj) {
        let key = _.keys(obj.voter)[0];
        if (!total[key]) {
          total[key] = [];
        }
        total[key].push({ ...obj.voter[key], campaign: obj.campaign_slug });
        return total;
      }, {});

      votes_group.group_by_campaign = parsed_votes.reduce(function (total, obj) {
        let key = obj.campaign_slug;
        if (!total[key]) {
          total[key] = [];
        }
        total[key].push({ ...obj.voter, campaign: obj.campaign_slug });
        return total;
      }, {});

      return { ...theElection, tags, campaigns, votes_group };
    }
    return null;
  },
  async firstAuth(ctx) {
    const { first_auth = '', value = '' } = ctx.request.body;
    const { election_id } = ctx.params;
    const entityElection = await strapi.services.elections.findOne({ id: election_id });
    const election = sanitizeEntity(entityElection, { model: strapi.models.elections });
    const beThereElection = Boolean(election);

    if (beThereElection) {
      const voters_values = _.pluck(_.flatten(Object.values(election.voters.data)) || [], first_auth);
      if (voters_values.indexOf(value) !== -1) {
        return 'ok';
      }
    }
    return null;
  },
  async secondAuth(ctx) {
    const { second_auth = '', value = '' } = ctx.request.body;
    const { election_id } = ctx.params;
    const entityElection = await strapi.services.elections.findOne({ id: election_id });
    const election = sanitizeEntity(entityElection, { model: strapi.models.elections });
    const beThereElection = Boolean(election);

    if (beThereElection) {
      const voters_values = _.pluck(_.flatten(Object.values(election.voters.data)) || [], second_auth);
      if (voters_values.indexOf(value) !== -1) {
        return 'ok';
      }
    }
    return null;
  },
  async vote(ctx) {
    const { campaign_slug = null, first_auth = null, second_auth = null } = ctx.request.body;
    const { election_id } = ctx.params;

    const entityElection = await strapi.services.elections.findOne({ id: election_id });
    const election = sanitizeEntity(entityElection, { model: strapi.models.elections });
    const beThereElection = Boolean(election);

    const entityVote = await strapi.services.votes.findOne({ first_auth, second_auth });
    const vote = sanitizeEntity(entityVote, { model: strapi.models.votes });
    const noHasVoted = !Boolean(vote);

    if (beThereElection && noHasVoted) {
      const { field: first_auth_field } = election.first_auth;
      const { field: second_auth_field } = election.second_auth;
      let voter = {};

      for (const tag of _.keys(election.voters.data)) {
        const finded = _.findWhere(election.voters.data[tag], { [first_auth_field]: first_auth, [second_auth_field]: second_auth });
        if (Boolean(finded)) {
          voter[tag] = finded;
          break;
        }
      }

      // const voters_objs = _.flatten(Object.values(election.voters.data));

      // let voter = voters_objs.find(voter => {
      //   return voter[first_auth_field] === first_auth && voter[second_auth_field] === second_auth;
      // });

      const campaigns_id = _.pluck(parseDoubleArrToObjArr(election.campaigns) || [], 'slug');

      function beFounded(arr, expectValue) {
        return arr.indexOf(expectValue) !== -1;
      }

      const canCreate = !_.isEmpty(voter) && beFounded(campaigns_id, campaign_slug);

      if (canCreate) {
        try {
          const entity = await strapi.services.votes.create({
            election: election_id,
            campaign_slug,
            voter,
            first_auth,
            second_auth
          });
          sanitizeEntity(entity, { model: strapi.models.votes });
          return 'ok';
        } catch (error) {
          console.log({ error });
          return error;
        }
      }
    }

    return null;
  }
};
