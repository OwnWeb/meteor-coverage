import Conf from './../context/conf';
import CoverageData from './../services/coverage-data';
import Core from './../services/core';
import ReportCommon from './report-common';
var istanbulAPI = Npm.require('istanbul-api'),
  ReportImpl = istanbulAPI.reportsImpl;
export default class {
  constructor(res, type, options) {
    this.res = res;
    this.options = options;
    this.options.verbose = Conf.IS_COVERAGE_VERBOSE ? true : false;
    this.report = ReportImpl.create(type, this.options);

    this.report.file = this.options.path;
    this.context = ReportCommon.getContext(this.report.file);
  }

  generate() {
    let coverage = Core.getCoverageObject();
    var childs = CoverageData.getLcovonlyReport(coverage);
    this.report.onStart(null, this.context);
    if (childs.length === 0) {
      this.res.setHeader('Content-type', 'text/plain');
      this.res.statusCode = 500;
      return this.res.end('{"type":"No coverage to export"}');
    }
    this.writeFile(childs);
    this.res.end('{"type":"success"}');
  }

  writeFile (childs) {
    for (var i = 0; i < childs.length; i++) {
            // Remove the COVERAGE_APP_FOLDER from the filepath
      if (Meteor.isPackageTest) {
        var regex = childs[i].fileCoverage.data.path.match(/.*packages\/[a-zA-Z\-\_]+\/(.*)/);
        if (regex && regex.length === 2) {
          childs[i].fileCoverage.data.path = regex[1];
        } else {
          childs[i].fileCoverage.data.path = childs[i].fileCoverage.data.path.replace(Conf.COVERAGE_APP_FOLDER, '');
        }
      } else {
        childs[i].fileCoverage.data.path = childs[i].fileCoverage.data.path.replace(Conf.COVERAGE_APP_FOLDER, '');
      }

      this.report.onDetail(childs[i]);
    }
        ///Todo: not working
        //this.report.onSummary(childs);
    this.report.onEnd();
  }

}
