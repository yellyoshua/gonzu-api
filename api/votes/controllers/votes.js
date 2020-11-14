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
  async findByElection(ctx) {
    const { election_id } = ctx.params;

    const entityElection = await strapi.services.elections.findOne({ id: election_id });
    const entityVotes = await strapi.services.votes.find({ election: election_id });

    const votes = entityVotes.map(entity => sanitizeEntity(entity, { model: strapi.models.votes }));
    const election = sanitizeEntity(entityElection, { model: strapi.models.elections });

    const theElection = _.omit({ ...election }, ['campaigns', 'voters', 'tags']);
    const vote_tags = _.pluck([...votes], 'tag_slug');
    const vote_tags_count = groupAndCount([...vote_tags]);
    const vote_tags_uniq = _.uniq([...vote_tags], false);
    const vote_campaigns = _.pluck([...votes], 'campaign_slug');
    const vote_campaigns_count = groupAndCount([...vote_campaigns]);
    const vote_campaigns_uniq = _.uniq([...vote_campaigns], false);
    const vote_voters = _.pluck([...votes], 'voter_identify');
    const vote_voters_count = groupAndCount([...vote_voters]);
    const vote_voters_uniq = _.uniq([...vote_voters], false);
    const vote_count = votes.length;

    let tags = [];
    let voters_tags_count = [];
    let campaigns = [];

    if (election) {
      try {
        const voters = parseDoubleArrToObjArr(election.voters.data) || [];
        tags = _.indexBy(parseDoubleArrToObjArr(election.tags) || [], 'slug');
        voters_tags_count = groupAndCount(_.pluck([...voters], 'tag_slug'));
        campaigns = _.indexBy(parseDoubleArrToObjArr(election.campaigns) || [], 'slug');
      } catch (error) {}
    }

    return {
      theElection,
      tags,
      voters_tags_count,
      campaigns,
      vote_tags,
      vote_tags_count,
      vote_tags_uniq,
      vote_campaigns,
      vote_campaigns_count,
      vote_campaigns_uniq,
      vote_voters,
      vote_voters_count,
      vote_voters_uniq,
      vote_count
    };
  },
  async firstAuth(ctx) {
    const { first_auth = '', value = '' } = ctx.request.body;
    const { election_id } = ctx.params;
    const entityElection = await strapi.services.elections.findOne({ id: election_id });
    const election = sanitizeEntity(entityElection, { model: strapi.models.elections });
    const beThereElection = Boolean(election);

    if (beThereElection) {
      const voters_values = _.pluck(parseDoubleArrToObjArr(election.voters.data) || [], first_auth);
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
      const voters_values = _.pluck(parseDoubleArrToObjArr(election.voters.data) || [], second_auth);
      if (voters_values.indexOf(value) !== -1) {
        return 'ok';
      }
    }
    return null;
  },
  async vote(ctx) {
    const { campaign_slug = null, voter_identify = null, tag_slug = null } = ctx.request.body;
    const { election_id } = ctx.params;

    const entityElection = await strapi.services.elections.findOne({ id: election_id });
    const election = sanitizeEntity(entityElection, { model: strapi.models.elections });
    const beThereElection = Boolean(election);

    const entityVote = await strapi.services.votes.findOne({ voter_identify });
    const vote = sanitizeEntity(entityVote, { model: strapi.models.votes });
    const noHasVoted = !Boolean(vote);

    if (beThereElection && noHasVoted) {
      const tags_id = _.pluck(parseDoubleArrToObjArr(election.tags) || [], 'slug');
      const voters_id = _.pluck(parseDoubleArrToObjArr(election.voters.data) || [], 'ci');
      const campaigns_id = _.pluck(parseDoubleArrToObjArr(election.campaigns) || [], 'slug');

      function beFounded(arr, expectValue) {
        return arr.indexOf(expectValue) !== -1;
      }

      const canCreate = beFounded(tags_id, tag_slug) && beFounded(voters_id, voter_identify) && beFounded(campaigns_id, campaign_slug);

      if (canCreate) {
        const entity = await strapi.services.votes.create({
          election: election_id,
          campaign_slug,
          voter_identify,
          tag_slug
        });
        sanitizeEntity(entity, { model: strapi.models.votes });
        return 'ok';
      }
    }

    return null;
  }
};
