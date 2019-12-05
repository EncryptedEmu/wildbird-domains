const express = require('express');
const wildcardSubdomains = require('wildcard-subdomains');
const helmet = require('helmet');
const express_enforces_ssl = require('express-enforces-ssl');
const exphbs = require('express-handlebars');
const helpers = require('handlebars-helpers')();

let app = express();

if (process.env.PRODUCTION) {
  app.enable('trust proxy') // this is necessary as heroku is under a proxy
  app.use(express_enforces_ssl());
  app.use(helmet());
}

let hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    ifeq: function(a, b, options) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    toJSON : function(object) {
      return JSON.stringify(object);
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(wildcardSubdomains({
  namespace: 's',
  whitelist: ['www', 'app', 'api']
}));

app.get('/', function(req,res){
  res.render('index')
})

app.get('/s/:subdomain', function(req,res){
  console.log('PARAMS', req.params)
  res.render('wildbird', { birdInput: req.params.subdomain })
})

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
