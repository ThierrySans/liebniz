var Promise = require('bluebird');
var Parser = require('expr-eval').Parser;

var parser = new Parser({
  operators: {
    add: false,
    concatenate: false,
    conditional: false,
    divide: false,
    factorial: false,
    multiply: false,
    power: false,
    remainder: false,
    subtract: false,
    // and, or, not
    logical: true,
    comparison: false
  }
});

var exports = module.exports = {};

exports.Suite = function Suite(description){
    this.description = description;
    this.ids = [];
    this.tests = [];
}

exports.Suite.prototype.add = function(id, options, fn){
    var self = this;
    // check wether the test.id is already in the suite
    if (self.ids.indexOf(id) > -1) throw new Error('\'' + id + '\' already in the suite');
    // check options
    Object.keys(options).forEach(function(key){
        if (['dependency', 'weight'].indexOf(key) == -1) throw new Error('invalid option ' + key + ' for \'' + id + '\'');
    });
    // check dependency option
    if ('dependency' in options){
        try{
            var parsed = parser.parse(options.dependency);
            var dependencies = parsed.variables();
        }catch(err){
            throw new Error('invalid dependency expression \'' + options.dependency + '\' for ' + id+ '\'');
        }
        dependencies.forEach(function(dependency){
            if (self.ids.indexOf(dependency) == -1) throw new Error('invalid dependency \'' + dependency + '\'  for \'' + id + '\'');
            parsed = parsed.substitute(dependency, 'true');
        });
        try{
            var checkDependency = parsed.evaluate();
        }catch(err){
            throw new Error('invalid dependency expression \'' + options.dependency + '\' for ' + id+ '\'');
        }
    }else{
        options.dependency = 'true';
    }
    options.weight = ('weight' in options)? options.weight : 0;
    self.ids.push(id);
    self.tests[id] = {id, dependency: options.dependency, weight: options.weight, fn};
}

exports.Suite.prototype.run = function(){
     var self = this;
    return Promise.reduce(self.ids, function(data, id){
        var test = self.tests[id];
        var parsed = parser.parse(test.dependency);
        var dependencies = parsed.variables();
        dependencies.forEach(function(dependency){
            parsed = parsed.substitute(dependency, self.tests[dependency].passed);
        });
        var checkDependency = parsed.evaluate();
        if (!checkDependency){
            test.executed = false;
            test.passed = false;
            test.reason = 'did not satisfy the dependency';
            return data;
        }else{
            return test.fn(data).then(function(res){
                test.executed = true;
                test.passed = true;
                test.reason = res;
                return data;
            }).catch(function(err){
                test.executed = true;
                test.passed = false;
                test.reason = err;
                return data;
            });
        }    
    }, {}).then(function(data){
        return self.ids.map(function(id){
            return self.tests[id];
        });
    });
}
