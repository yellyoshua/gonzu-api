'use strict';
const { sanitizeEntity } = require('strapi-utils');
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findBySlug(ctx) {
    const { slug } = ctx.params;

    const entity = await strapi.services.publication.findOne({ slug });
    return sanitizeEntity(entity, { model: strapi.models.publication });
  }
};
