const fs = require('fs');
const path = require('path');

var test = require('./index');

var suite = new test.Suite();

suite.add('failTest', {}, function(data){
    return new Promise(function(resolve, reject){
        reject('this test did not succeed');
    });
});

suite.add('successTest', {}, function(data){
    return new Promise(function(resolve, reject){
        resolve('this test did succeed');
    });
});

suite.add('anotherSuccessTest', {}, function(data){
    return new Promise(function(resolve, reject){
        resolve('this test did succeed');
    });
});

suite.add('aDependentSuccessTest', {dependency: 'successTest'}, function(data){
    return new Promise(function(resolve, reject){
        resolve('this test did succeed');
    });
});

suite.add('aTransitiveDependentSuccessTest', {dependency: 'aDependentSuccessTest'}, function(data){
    return new Promise(function(resolve, reject){
        resolve('this test did succeed');
    });
});

suite.add('aDoubleDependentSuccessTest', {dependency: 'successTest and anotherSuccessTest'}, function(data){
    return new Promise(function(resolve, reject){
        resolve('this test did succeed');
    });
});

suite.add('aDependentFailTest', {dependency: 'failTest'}, function(data){
    return new Promise(function(resolve, reject){
        resolve('this test did succeed');
    });
});

suite.add('aTransitiveDependentFailTest', {dependency: 'aDependentFailTest'}, function(data){
    return new Promise(function(resolve, reject){
        resolve('this test did succeed');
    });
});

suite.add('aDoubleDependentFailTest', {dependency: 'failTest and successTest'}, function(data){
    return new Promise(function(resolve, reject){
        resolve('this test did succeed');
    });
});

suite.add('anotherDoubleDependentFailTest', {dependency: 'successTest and failTest'}, function(data){
    return new Promise(function(resolve, reject){
        resolve('this test did succeed');
    });
});

suite.run().then(function(res){
    console.log(res);
});