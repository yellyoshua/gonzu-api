'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  beforeCreate(election) {
    election.voters = election.voters || { data: [], fields: [] };
    election.tags = election.tags || [];
    election.candidates = election.candidates || [];
    election.campaigns = election.campaigns || [];
    election.status = election.status || 'no_active';
    election.cargos = election.cargos || [];
    election.first_auth = election.first_auth || { active: false, field: '', name: 'Auth1' };
    election.second_auth = election.second_auth || { active: false, field: '', name: 'Auth2' };
  }
};
