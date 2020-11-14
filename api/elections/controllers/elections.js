'use strict';
const { sanitizeEntity } = require('strapi-utils');
const _ = require('underscore');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async clientFind() {
    const entity = await strapi.services.elections.find();
    const elections = entity.map(entity => {
      const election = sanitizeEntity(entity, { model: strapi.models.elections });
      return _.omit({ ...election }, ['campaigns', 'voters', 'tags', 'candidates', 'cargos', 'first_auth', 'second_auth']);
    });

    return elections;
  },
  async clientFindOne(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.services.elections.findOne({ id });
    const election = sanitizeEntity(entity, { model: strapi.models.elections });
    if (election) {
      return _.omit({ ...election }, ['campaigns', 'voters', 'tags', 'candidates', 'cargos', 'first_auth', 'second_auth']);
    }

    return null;
  }
};
