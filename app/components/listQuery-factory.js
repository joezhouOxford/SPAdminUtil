/**
 * Created by zhoujd on 16/05/2016.
 */
'use strict';

angular.module('myApp.listQuery-factory', [])

    .factory('listQueryFactory', [function() {
        
        return function(text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        };
    }]);