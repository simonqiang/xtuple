var _      = require("underscore"),
    assert = require('chai').assert,
    dblib  = require('../dblib');

(function () {
  "use strict";
  var group  = "bom",
      name   = "detail"
      ;

  describe(group + '-' + name + ' mql', function () {
    var datasource = dblib.datasource,
        adminCred  = dblib.generateCreds(),
        constants  = {always: 'Always', never: 'Never'},
        mql
        ;

    it("needs the query", function (done) {
      var sql = "select metasql_query from metasql"        +
                " where metasql_group = '" + group + "'"   +
                "   and metasql_name  = '" + name  + "'"   +
                "   and metasql_grade = 0;";
      datasource.query(sql, adminCred, function (err, res) {
        assert.isNull(err);
        assert.equal(res.rowCount, 1);
        mql = res.rows[0].metasql_query;
        mql = mql.replace(/"/g, "'").replace(/--.*\n/g, "").replace(/\n/g, " ");
        done();
      });
    });

    _.each([ constants,
             _.extend({}, constants, { effectiveDays:      14 }),
             _.extend({}, constants, { byIndented:      'true'}),
             _.extend({}, constants, { bySingleLvl:     'true'}),
             _.extend({}, constants, { bySummarized:    'true'}),
             _.extend({}, constants, { expiredDays:         7 }),
             _.extend({}, constants, { futureDays:          7 }),
             _.extend({}, constants, { item_id:           309 }),
             _.extend({}, constants, { revision_id:        -1 }),
             _.extend({}, constants, { custgrp_id:         25 })
    ], function (p) {
      it.skip(JSON.stringify(p), function (done) {
        var sql = "do $$"                 +
                  "var params = { params: " + JSON.stringify(p) + "}," +
                  "    mql    = \""         + mql              + "\"," +
                  "    sql    = XT.MetaSQL.parser.parse(mql, params)," +
                  "    rows   = plv8.execute(sql);"                    +
                  "$$ language plv8;";
        datasource.query(sql, adminCred, function (err /*, res*/) {
          assert.isNull(err);
          done();
        });
      });
    });
  });

}());
