'use strict';
const { sanitizeEntity } = require('strapi-utils');
const _ = require('underscore');

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

module.exports = {
  async clientFind() {
    const entity = await strapi.services.elections.find();
    const elections = entity.map(entity => {
      const election = sanitizeEntity(entity, { model: strapi.models.elections });
      const campaigns = _.indexBy(parseDoubleArrToObjArr(election.campaigns) || [], 'slug');
      const candidates = parseDoubleArrToObjArr(election.candidates) || [];
      const cargos = _.indexBy(election.cargos, 'slug');
      return _.omit({ ...election, campaigns, candidates, cargos }, [, 'voters', 'tags']);
    });

    return elections;
  },
  async clientFindOne(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.services.elections.findOne({ id });
    const election = sanitizeEntity(entity, { model: strapi.models.elections });
    if (election) {
      const campaigns = _.indexBy(parseDoubleArrToObjArr(election.campaigns) || [], 'slug');
      const candidates = parseDoubleArrToObjArr(election.candidates) || [];
      const cargos = _.indexBy(election.cargos, 'slug');
      return _.omit({ ...election, campaigns, candidates, cargos }, ['voters', 'tags']);
    }

    return null;
  },
  async updateVoters(ctx) {
    const { id } = ctx.params;
    const theElection = ctx.request.body;

    const entityElection = await strapi.services.elections.findOne({ id });
    const election = sanitizeEntity(entityElection, { model: strapi.models.elections });

    const entityVotes = await strapi.services.votes.find({ election: id });
    const votes = entityVotes.map(e => sanitizeEntity(e, { model: strapi.models.votes }));

    if (election) {
      votes.forEach(async vote => {
        try {
          await strapi.services.votes.delete({ id: vote.id });
        } catch (error) {}
      });

      const entity = await strapi.services.elections.update({ id }, theElection);
      return sanitizeEntity(entity, { model: strapi.models.elections });
    }
    return null;
  }
};
