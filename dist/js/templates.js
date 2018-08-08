this["templates"] = this["templates"] || {};
this["templates"]["greeting"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<p>Starting</p>\n<p>"
    + alias4(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"message","hash":{},"data":data}) : helper)))
    + " "
    + alias4(((helper = (helper = helpers.test || (depth0 != null ? depth0.test : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"test","hash":{},"data":data}) : helper)))
    + "</p>\n<p>Stopping</p>";
},"useData":true});