(function() {
    angular.module('validation', ['validation.provider', 'validation.directive']);
}).call(this);

(function() {
    angular.module('validation.provider', [])
        .provider('$validation', function() {


            var $injector,
                $scope,
                $http,
                $q,
                $timeout,
                _this = this;


            /**
             * Setup the provider
             * @param injector
             */
            var setup = function(injector) {
                $injector = injector;
                $scope = $injector.get('$rootScope');
                $http = $injector.get('$http');
                $q = $injector.get('$q');
                $timeout = $injector.get('$timeout');
            };


            /**
             * Define validation type RegExp
             * @type {{}}
             */
            var expression = {};


            /**
             * default error, success message
             * @type {{}}
             */
            var defaultMsg = {};


            /**
             * Allow user to set a custom Expression, do remember set the default message using setDefaultMsg
             * @param obj
             * @returns {*}
             */
            this.setExpression = function(obj) {
                angular.extend(expression, obj);
                return _this;
            };


            /**
             * Get the Expression
             * @param exprs
             * @returns {*}
             */
            this.getExpression = function(exprs) {
                return expression[exprs];
            };


            /**
             * Allow user to set default message
             * @param obj
             * @returns {*}
             */
            this.setDefaultMsg = function(obj) {
                angular.extend(defaultMsg, obj);
                return _this;
            };


            /**
             * Get the Default Message
             * @param msg
             * @returns {*}
             */
            this.getDefaultMsg = function(msg) {
                return defaultMsg[msg];
            };


            /**
             * Override the errorHTML function
             * @param func
             * @returns {*}
             */
            this.setErrorHTML = function(func) {
                if (func.constructor !== Function) {
                    return;
                }

                _this.getErrorHTML = func;

                return _this;
            };


            /**
             * Invalid message HTML, here's the default
             * @param message
             * @returns {string}
             */
            this.getErrorHTML = function(message) {
                return '<p class="validation-invalid">' + message + '</p>';
            };


            /**
             * Override the successHTML function
             * @param func
             * @returns {*}
             */
            this.setSuccessHTML = function(func) {
                if (func.constructor !== Function) {
                    return;
                }

                _this.getSuccessHTML = func;

                return _this;
            };


            /**
             * Valid message HTML, here's the default
             * @param message
             * @returns {string}
             */
            this.getSuccessHTML = function(message) {
                return '<p class="validation-valid">' + message + '</p>';
            };


            /**
             * Whether show the validation success message
             * You can easily change this to false in your config
             * example: $validationProvider.showSuccessMessage = false;
             * @type {boolean}
             */
            this.showSuccessMessage = true;


            /**
             * Whether show the validation error message
             * You can easily change this to false in your config
             * example: $validationProvider.showErrorMessage = false;
             * @type {boolean}
             */
            this.showErrorMessage = true;


            /**
             * Check form valid, return true
             * checkValid(Form): Check the specific form(Form) valid from angular `$valid`
             * @param form
             * @returns {boolean}
             */
            this.checkValid = function(form) {
                if (form.$valid === undefined) {
                    return false;
                }
                return (form && form.$valid === true);
            };


            /**
             * Validate the form when click submit, when `validMethod = submit`
             * @param form
             * @returns {promise|*}
             */
            this.validate = function(form) {
                var deferred = $q.defer(),
                    idx = 0;

                if (form === undefined) {
                    console.error('This is not a regular Form name scope');
                    deferred.reject('This is not a regular Form name scope');
                    return deferred.promise;
                }
                // console.log(form.validationId);
                // console.log(form.constructor);
                // console.log(form);
                if (form.validationId) { // single
                    $scope.$broadcast(form.$name + 'submit-' + form.validationId, idx++);
                } else if (form.constructor === Array) { // multiple
                    for (var k in form) {
                        $scope.$broadcast(form[k].$name + 'submit-' + form[k].validationId, idx++);
                    }
                } else {
                    for (var i in form) { // whole scope
                        if (i[0] !== '$' && form[i].hasOwnProperty('$dirty')) {
                            $scope.$broadcast(i + 'submit-' + form[i].validationId, idx++);
                        }
                    }
                }

                deferred.promise.success = function(fn) {
                    deferred.promise.then(function(value) {
                        fn(value);
                    });
                    return deferred.promise;
                };

                deferred.promise.error = function(fn) {
                    deferred.promise.then(null, function(value) {
                        fn(value);
                    });
                    return deferred.promise;
                };

                $timeout(function() {
                    if (_this.checkValid(form)) {
                        deferred.resolve('success');
                    } else {
                        deferred.reject('error');
                    }
                });

                return deferred.promise;
            };


            /**
             * reset the specific form
             * @param form
             */
            this.reset = function(form) {
                if (form === undefined) {
                    console.error('This is not a regular Form name scope');
                    return;
                }

                if (form.validationId) {
                    $scope.$broadcast(form.$name + 'reset-' + form.validationId);
                } else if (form.constructor === Array) {
                    for (var k in form) {
                        $scope.$broadcast(form[k].$name + 'reset-' + form[k].validationId);
                    }
                } else {
                    for (var i in form) {
                        if (i[0] !== '$' && form[i].hasOwnProperty('$dirty')) {
                            $scope.$broadcast(i + 'reset-' + form[i].validationId);
                        }
                    }
                }
            };


            /**
             * $get
             * @returns {{setErrorHTML: *, getErrorHTML: Function, setSuccessHTML: *, getSuccessHTML: Function, setExpression: *, getExpression: Function, setDefaultMsg: *, getDefaultMsg: Function, checkValid: Function, validate: Function, reset: Function}}
             */
            this.$get = ['$injector',
                function($injector) {
                    setup($injector);
                    return {
                        setErrorHTML: this.setErrorHTML,
                        getErrorHTML: this.getErrorHTML,
                        setSuccessHTML: this.setSuccessHTML,
                        getSuccessHTML: this.getSuccessHTML,
                        setExpression: this.setExpression,
                        getExpression: this.getExpression,
                        setDefaultMsg: this.setDefaultMsg,
                        getDefaultMsg: this.getDefaultMsg,
                        showSuccessMessage: this.showSuccessMessage,
                        showErrorMessage: this.showErrorMessage,
                        checkValid: this.checkValid,
                        validate: this.validate,
                        reset: this.reset
                    };
                }
            ];

        });
}).call(this);

(function() {
    angular.module('validation.directive', ['validation.provider'])
        .directive('validator', ['$injector',
            function($injector) {

                var $validationProvider = $injector.get('$validation'),
                    $q = $injector.get('$q'),
                    $timeout = $injector.get('$timeout');

                /**
                 * Do this function if validation valid
                 * @param element
                 * @param validMessage
                 * @param validation
                 * @param callback
                 * @param ctrl
                 * @returns {}
                 */
                var validFunc = function(element, validMessage, validation, callback, ctrl) {
                    if ($validationProvider.showSuccessMessage) {
                        element.next().html($validationProvider.getSuccessHTML(validMessage || $validationProvider.getDefaultMsg(validation).success));
                    } else {
                        element.next().html('');
                    }
                    ctrl.$setValidity(ctrl.$name, true);
                    if (callback) callback();

                    return true;
                };


                /**
                 * Do this function if validation invalid
                 * @param element
                 * @param validMessage
                 * @param validation
                 * @param callback
                 * @param ctrl
                 * @returns {}
                 */
                var invalidFunc = function(element, validMessage, validation, callback, ctrl) {
                    if ($validationProvider.showErrorMessage) {
                        element.next().html($validationProvider.getErrorHTML(validMessage || $validationProvider.getDefaultMsg(validation).error));
                    } else {
                        element.next().html('');
                    }
                    ctrl.$setValidity(ctrl.$name, false);
                    if (callback) callback();

                    return false;
                };


                /**
                 * If var is true, focus element when validate end
                 * @type {boolean}
                 ***private variable
                 */
                var isFocusElement = false;


                /**
                 * Check Validation with Function or RegExp
                 * @param scope
                 * @param element
                 * @param attrs
                 * @param ctrl
                 * @param validation
                 * @param value
                 * @returns {}
                 */
                var checkValidation = function(scope, element, attrs, ctrl, validation, value) {



                    var validators = validation.slice(0),
                        validator = validators[0].trim(),
                        leftValidation = validators.slice(1),
                        successMessage = validator + 'SuccessMessage',
                        errorMessage = validator + 'ErrorMessage',
                        expression = $validationProvider.getExpression(validator),
                        valid = {
                            success: function() {
                                // console.log("success");
                                validFunc(element, attrs[successMessage], validator, scope.validCallback, ctrl);
                                if (leftValidation.length) {
                                    checkValidation(scope, element, attrs, ctrl, leftValidation, value);
                                } else {
                                    return true;
                                }
                            },
                            error: function() {
                                // console.log("error");
                                return invalidFunc(element, attrs[errorMessage], validator, scope.invalidCallback, ctrl);
                            }
                        };
                    // console.log("checking " + expression);
                    if (expression === undefined) {
                        console.error('You are using undefined validator "%s"', validator);
                        if (leftValidation.length) {
                            checkValidation(scope, element, attrs, ctrl, leftValidation, value);
                        } else {
                            return;
                        }
                    }
                    // Check with Function
                    // console.log(expression.constructor);
                    if (expression.constructor === Function) {
                        return $q.all([$validationProvider.getExpression(validator)(value, scope, element, attrs)])
                            .then(function(data) {
                                // console.log(data);
                                if (data && data.length > 0 && data[0]) {
                                    return valid.success();
                                } else {
                                    return valid.error();
                                }
                            }, function() {
                                return valid.error();
                            });
                    }
                    // Check with RegExp
                    else if (expression.constructor === RegExp) {
                        return $validationProvider.getExpression(validator).test(value) ? valid.success() : valid.error();
                    } else {
                        return valid.error();
                    }
                };


                /**
                 * generate unique guid
                 */
                var s4 = function() {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                };
                var guid = function() {
                    return (s4() + s4() + s4() + s4());
                };


                return {
                    restrict: 'A',
                    require: 'ngModel',
                    scope: {
                        model: '=ngModel',
                        initialValidity: '=initialValidity',
                        validCallback: '&',
                        invalidCallback: '&',
                        req: "@req"
                    },
                    link: function(scope, element, attrs, ctrl) {

                        
                            scope.$watch('req', function (newval, oldval) {
                                // console.log(element[0]);
                                // console.log(ctrl.$name);
                                    /**
                                 * watch
                                 * @type {watch}
                                 *
                                 * Use to collect scope.$watch method
                                 *
                                 * use watch() to destroy the $watch method
                                 */
                                var watch = function() {};

                                /**
                                 * Set initial validity to false if no boolean value is transmitted
                                 */
                                var initialValidity = false;
                                if (typeof scope.initialValidity === 'boolean') {
                                    initialValidity = scope.initialValidity;
                                }

                                /**
                                 * Set custom initial validity
                                 * Usage: <input initial-validity="true" ... >
                                 */
                                ctrl.$setValidity(ctrl.$name, initialValidity);


                                /**
                                 * validator
                                 * @type {Array}
                                 *
                                 * Convert user input String to Array
                                 */
                                 var validation;

                                var req = scope.req;
                                var v = scope.$eval(req);
                                // console.log(req);
                                validation = v.split(',');
                                // console.log(ctrl.$name);
                                // console.log('validator is: ');
                                // console.log(validation);

                                if(req[0] === 'f' && req[1] === 'a' && req[2] === 'l' &&
                                    req[3] === 's' && req[4] === 'e' && (req[5] === '?' || req[5] === ' ')){
                                    ctrl.$setValidity(ctrl.$name, true);
                                }
                                else
                                    ctrl.$setValidity(ctrl.$name, false);
                                // console.log(ctrl.$valid);

                                /**
                                 * guid use
                                 */
                                var uid = ctrl.validationId = guid();

                                /**
                                 * Valid/Invalid Message
                                 */
                                element.after('<span></span>');



                                /**
                                 * Reset the validation for specific form
                                 */
                                scope.$on(ctrl.$name + 'reset-' + uid, function() {

                                    /**
                                     * clear scope.$watch here
                                     * when reset status
                                     * clear the $watch method to prevent
                                     * $watch again while reset the form
                                     */
                                    watch();

                                    isFocusElement = false;
                                    ctrl.$setViewValue('');
                                    ctrl.$setPristine();
                                    ctrl.$setValidity(ctrl.$name, false);
                                    ctrl.$render();
                                    element.next().html('');
                                });



                                /**
                                 * Check validator
                                 */

                                (function() {
                                    /**
                                     * Click submit form, check the validity when submit
                                     */
                                    scope.$on(ctrl.$name + 'submit-' + uid, function(event, index) {
                                        // console.log("Submit broadcast caught");
                                        // console.log(element);
                                        var value = element[0].value,
                                            isValid = false;

                                        if (index === 0) {
                                            isFocusElement = false;
                                        }

                                        isValid = checkValidation(scope, element, attrs, ctrl, validation, value);
                                        
                                        if (attrs.validMethod === 'submit') {
                                            watch(); // clear previous scope.$watch
                                            watch = scope.$watch('model', function(value, oldValue) {
                                                // don't watch when init
                                                if (value === oldValue) {
                                                    return;
                                                }

                                                // scope.$watch will translate '' to undefined
                                                // undefined/null will pass the required submit /^.+/
                                                // cause some error in this validation
                                                if (value === undefined || value === null) {
                                                    value = '';
                                                }

                                                isValid = checkValidation(scope, element, attrs, ctrl, validation, value);
                                            });

                                        }

                                        // Focus first input element when submit error #11
                                        isValid.then(function (arg) {
                                            if (!isFocusElement && !arg) {
                                                isFocusElement = true;
                                                element[0].focus();
                                            }
                                        });
                                        
                                    });

                                    /**
                                     * Validate blur method
                                     */
                                    if (attrs.validMethod === 'blur') {
                                        element.bind('blur', function() {
                                            var value = element[0].value;
                                            scope.$apply(function() {
                                                checkValidation(scope, element, attrs, ctrl, validation, value);
                                            });
                                        });

                                        return;
                                    }

                                    /**
                                     * Validate submit & submit-only method
                                     */
                                    if (attrs.validMethod === 'submit' || attrs.validMethod === 'submit-only') {
                                        return;
                                    }

                                    /**
                                     * Validate watch method
                                     * This is the default method
                                     */
                                    scope.$watch('model', function(value) {
                                        /**
                                         * dirty, pristine, viewValue control here
                                         */
  
                                        if (ctrl.$pristine && ctrl.$viewValue) {
                                            // has value when initial
                                            ctrl.$setViewValue(ctrl.$viewValue);
                                        } else if (ctrl.$pristine) {
                                            // Don't validate form when the input is clean(pristine)
                                            element.next().html('');
                                            return;
                                        }
                                        checkValidation(scope, element, attrs, ctrl, validation, value);
                                    });

                                })();








                        });
                        
                        



                        
                        $timeout(function() {
                            /**
                             * Don't showup the validation Message
                             */
                            attrs.$observe('noValidationMessage', function(value) {
                                var el = element.next();
                                if (value == 'true' || value === true) {
                                    el.css('display', 'none');
                                } else if (value == 'false' || value === false) {
                                    el.css('display', 'block');
                                } else {}
                            });
                        });

                    }
                };
            }
        ])

    .directive('validationSubmit', ['$injector',
        function($injector) {

            var $validationProvider = $injector.get('$validation'),
                $timeout = $injector.get('$timeout'),
                $parse = $injector.get('$parse');

            return {
                priority: 1, // execute before ng-click (0)
                require: '?ngClick',
                link: function postLink(scope, element, attrs) {
                    var form = $parse(attrs.validationSubmit)(scope);
                    $timeout(function() {
                        // Disable ng-click event propagation
                        element.off('click');
                        element.on('click', function(e) {
                            e.preventDefault();

                            $validationProvider.validate(form)
                                .success(function() {
                                    $parse(attrs.ngClick)(scope);
                                })
                                .error(function () {
                                    
                                });
                        });
                    });

                }
            };
        }
    ])

    .directive('validationSubmit2', ['$injector',
        function($injector) {

            var $validationProvider = $injector.get('$validation'),
                $timeout = $injector.get('$timeout'),
                $parse = $injector.get('$parse'),
                $q = $injector.get('$q');

            return {
                priority: 1, // execute before ng-click (0)
                require: '?ngClick',
                link: function postLink(scope, element, attrs) {
                    // console.log(attrs.validationSubmit2);
                        

                        $timeout(function() {
                            // Disable ng-click event propagation
                            element.off('click');
                            element.on('click', function(e) {
                                var x = $parse(attrs.validationSubmit2)(scope);
                                x = Object.keys(x);
                                // console.log(x);
                                var count = 0;
                                var defer = $q.defer();
                                var promises = [];

                                angular.forEach(x, function(form_name){
                                    // console.log(form_name);
                                    var form = $parse(attrs.validationSubmit2 + '.' + form_name)(scope);
                                    if(!angular.isUndefined(form)){
                                        e.preventDefault();
                                        
                                        // console.log(form);
                                        // e.preventDefault();
                                        var inner_form = $parse(attrs.validationSubmit2 + '.' + form_name + '.StepInnerForm' )(scope);
                                        // console.log(inner_form);
                                        promises.push($validationProvider.validate(form));
                                        if(!angular.isUndefined(inner_form)){
                                            
                                            promises.push($validationProvider.validate(inner_form));
                                        }
                                    }
                                        
                                });
                                // $parse(attrs.ngClick)(scope);
                                var pr = $q.all(promises);
                                pr.then(function (arg) {
                                    console.log("promises completeed");
                                    defer.resolve(arg);
                                }).then(function () {
                                    $parse(attrs.ngClick)(scope);
                                });
                                pr.catch(function () {
                                    
                                    console.log("promises notcompleteed");
                                   // $parse(attrs.ngClick)(scope);
                                });

                                
                            });
                        });
                    }

            };
        }
    ])
    .directive('validationSubmit3', ['$injector',
        function($injector) {

            var $validationProvider = $injector.get('$validation'),
                $timeout = $injector.get('$timeout'),
                $parse = $injector.get('$parse'),
                $q = $injector.get('$q');

            return {
                priority: 1, // execute before ng-click (0)
                require: '?ngClick',
                link: function postLink(scope, element, attrs) {
                    console.log(attrs.validationSubmit3);
                        

                        $timeout(function() {
                            // Disable ng-click event propagation
                            element.off('click');
                            element.on('click', function(e) {
                                var x = $parse(attrs.validationSubmit3)(scope);
                                console.log(attrs.validationSubmit3);
                                console.log(x);
                                x = Object.keys(x);
                                console.log(x);
                                var count = 0;
                                var defer = $q.defer();
                                var promises = [];

                                angular.forEach(x, function(form_name){
                                    console.log(form_name);
                                    var form = $parse(attrs.validationSubmit3 + '.' + form_name)(scope);
                                    if(!angular.isUndefined(form)){
                                        e.preventDefault();
                                        
                                        console.log(form);
                                        // e.preventDefault();
                                        var inner_form = $parse(attrs.validationSubmit3 + '.' + form_name + '.StepInnerForm' )(scope);
                                        console.log(inner_form);
                                        promises.push($validationProvider.validate(form));
                                        if(!angular.isUndefined(inner_form)){
                                            
                                            promises.push($validationProvider.validate(inner_form));
                                        }
                                    }
                                        
                                });
                                // $parse(attrs.ngClick)(scope);
                                var pr = $q.all(promises);
                                pr.then(function (arg) {
                                    console.log("promises completeed");
                                    defer.resolve(arg);
                                }).then(function () {
                                    console.log(attrs.ngClick);
                                    console.log(scope);
                                    console.log($parse(attrs.ngClick)(scope));
                                });
                                pr.catch(function () {
                                    
                                    console.log(scope);
                                    console.log("promises notcompleteed");
                                   // $parse(attrs.ngClick)(scope);
                                });

                                
                            });
                        });
                    }

            };
        }
    ])

    .directive('validationReset', ['$injector',
        function($injector) {

            var $validationProvider = $injector.get('$validation'),
                $timeout = $injector.get('$timeout'),
                $parse = $injector.get('$parse');

            return {
                link: function postLink(scope, element, attrs) {
                    var form = $parse(attrs.validationReset)(scope);

                    $timeout(function() {
                        element.on('click', function(e) {
                            e.preventDefault();
                            $validationProvider.reset(form);
                        });
                    });

                }
            };
        }
    ]);

}).call(this);





























// MY CUSTOM THINGS HERE




