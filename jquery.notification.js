/*
 *  Project: JNP - jQuery Notification Plugin for Twitter Bootstrap
 *  Description: A notification messages for use with twitter bootstrap
 *  Author: Fabian Torres
 *  License: The MIT License (MIT)
 *
 * Copyright (c) <2013> <copyright Fabian Torres>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 
*med * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT O ROTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
;(function ( $, window, document, undefined ) {

    $.jnp = function(element, options) {

        var defaults = {
            bootstrap: 'true', // It uses the bootstrap twitter style or custom style
            background: '#666', // overlay background
            opacity: .8, // values from 0 to 1
            css: false, // False to use plugin css, true to use your own css
            clickOn: null, // element DOM that fires the renderization
            contextual: 'warning', // Values: [success, error, info, warning]
            position : 'wrapper', // Values: [wrapper, top, bottom, fancy]
            time: 0, // in seconds. Use it only when we don't want a inmediatly renderization
            duration: 0, // in seconds Ust it if you want the message disappear automatically
            title: null, // title to show (Null if you don't want a title)
            message: 'Notification message here!', // message to show
            inmediatly: true, // to render in the initiation use true, instead use false and render function
            height: null, // wrapper height
            width: null, // wrapper width
            closeBtn: true, // To use a btn close or not
            id: null //add a id element to the wrapper
        };

        var jnp = this; // reference to the object
        
        jnp.options = {}        

        var init = function(element, options) {
            jnp.element = element ? element : 'body';    // reference to the actual DOM element        
            jnp.$el = $(jnp.element); // reference to the jQuery version of DOM element
            jnp.options = $.fn.extend(true, {}, defaults, options);
            jnp._defaults = defaults;
            jnp._name = "JNP";
            jnp._css = jnp._name.toLowerCase(); // css prefix
            setOptions();
            draw();
            if(jnp.options.inmediatly) {
                render();
            }
            else if(jnp.options.time > 0) {
                var interval = window.setInterval(function() {
                    render();
                    window.clearInterval(interval);
                }, jnp.options.time);
            }
            if(jnp.options.clickOn){
                renderLater();
            }
        }

        jnp.setTitle = function(title) {
            jnp.options.title = (typeof(title) == 'string') ? title : null;
            jnp.$html.child.title.text(jnp.options.title);
            setOverlay();
        }

        jnp.setMessage = function(message) {
            jnp.options.message = message;
            jnp.$html.child.message.html(jnp.options.message);
            setOverlay();
        }

        jnp.setContent = function(title, message) {
            jnp.options.title = (typeof(title) == 'string') ? title : null;
            jnp.options.message = message;
            jnp.$html.child.title.text(jnp.options.title);
            jnp.$html.child.message.html(jnp.options.message);
            setOverlay();
        }

        jnp.close = function() {
            if(jnp.options.position != 'wrapper')
                jnp.$overlay.hide();
            jnp.$wrapper.hide();
        }

        jnp.show = function() {
            if(jnp.options.position != 'wrapper')
                jnp.$overlay.show();
            jnp.$wrapper.show();
        }

        jnp.render = function() {
            if(!jnp.options.inmediatly) {
                render();
            }
            else {
                jnp.show();
            }
        }

        jnp.destroy = function() {
            if(jnp.options.position != 'wrapper')
                jnp.$overlay.remove();
            jnp.$wrapper.remove();
        }

        /**
         * Avoid ugly parameters
         */
        var setOptions = function() {
            jnp.options.bootstrap = setToBoolean(jnp.options.bootstrap);
            jnp.options.css = setToBoolean(jnp.options.css);
            jnp.options.inmediatly = setToBoolean(jnp.options.inmediatly);
            jnp.options.contextual = jnp.options.contextual.toLowerCase();
            jnp.options.contextual = $.inArray(jnp.options.contextual, ['warning', 'success', 'error', 'info']) ? jnp.options.contextual : 'warning';
            jnp.options.position = jnp.options.position.toLowerCase();
            jnp.options.position = $.inArray(jnp.options.position, ['wrapper', 'top', 'bottom', 'fancy']) ? jnp.options.position : 'wrapper';
            jnp.options.opacity = parseFloat(jnp.options.opacity);
            jnp.options.duration = parseFloat(jnp.options.duration) * 1000; // change to miliseconds
            jnp.options.time = parseFloat(jnp.options.time) * 1000; // change to miliseconds
            jnp.options.title = (typeof(jnp.options.title) == 'string') ? capitaliseFirstLetter(jnp.options.title) : null;
            jnp.options.height = (typeof(jnp.options.height) == 'number' || 
                typeof(jnp.options.height) == 'string') ? parseFloat(jnp.options.height) : 'auto';
            jnp.options.width = (typeof(jnp.options.width) == 'number' || 
                typeof(jnp.options.width) == 'string') ? parseFloat(jnp.options.width) : 'auto';
            jnp.options.closeBtn = setToBoolean(jnp.options.closeBtn);

            if(jnp.options.time > 0)
                jnp.options.inmediatly = false;

            jnp.options.id = (typeof(jnp.options.id) == 'string') ? jnp.options.id : null;
            if(jnp.options.id != null && jnp.options.id == jnp.$el.attr('id'))
                jnp.options.id += '-' + jnp._css;
        }

        /**
         * @return {Boolean} value
         */
        var setToBoolean = function(value) {
            return (value == true || 
                    (typeof(value) == 'string' && value.toLowerCase() == 'true')  ||
                    value == '1' ||
                    value == 1) ? true : false;
        }

        /**
         * Capitalise the first letter of a string
         * @param {String} string
         */
        var capitaliseFirstLetter = function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        /**
         * Draw the HTML code
         */
        var draw = function() {
            if(jnp.element == 'body') {
                jnp.$el = $('<div />').addClass(jnp._css + '-virtual-element');
                $('body').prepend(jnp.$el);
            }
            if (jnp.options.bootstrap)
                buildBootstrap();
            else
                buildDOM();            
            if (!jnp.options.bootstrap && !jnp.options.css)
                addStyles();
            setPlace();
            drawOverlay();            
        }

        /**
         * Set a overlay layer
         */
        var drawOverlay = function() {
            jnp.$overlay = $('<div />').addClass(jnp._css + '-overlay');
            jnp.$overlay.css({
                'position': 'absolute',
                'z-index': '9998',
                'display': 'none',
                'left': 0,
                'top': jnp.options.position == 'bottom' ?  'auto' : 0,
                'bottom': jnp.options.position == 'bottom' ?  0 : 'auto'
            });
            if(!jnp.options.css) {
                jnp.$overlay.css({
                    'padding': jnp.options.position == 'fancy' ? 0 : '10px 0px',
                    'height': (jnp.options.position == 'fancy') ? '100%' : jnp.$wrapper.height(),
                    'width': '100%',
                    'background-color': jnp.options.background,
                    'opacity': jnp.options.opacity,
                });
                if((jnp.options.position != 'fancy'))
                    //It retains only leading numbers and discards all the rest. -> parseInt(string, radix)
                    jnp.$overlay.height(jnp.$overlay.height() + parseInt(jnp.$overlay.css('padding-top'), 10) + parseInt(jnp.$overlay.css('padding-bottom'), 10));
            }           
            
            $('body').prepend(jnp.$overlay);
            if(jnp.options.css)
                jnp.$overlay.addClass(jnp._css + '-custom');
        }

        /**
         * it creates events to handle
         */
        var setEvents = function() {            
            // events to close fancy notification
            if (jnp.$overlay) {
                jnp.$overlay.one({
                    click: function() {
                        jnp.$overlay.fadeOut('slow', function() {
                            jnp.$overlay.hide();
                        });
                        jnp.$wrapper.fadeOut('slow', function() {
                            jnp.$wrapper.hide();
                        });
                    }                    
                });
                if (jnp.options.closeBtn) {
                    jnp.$html.child.close.one({
                        click: function() {
                            jnp.$overlay.fadeOut('slow', function() {
                                jnp.$overlay.hide();
                            });
                            jnp.$wrapper.fadeOut('slow', function() {
                                jnp.$wrapper.hide();
                            });
                        }                    
                    });
                }
            }

            if(jnp.options.duration > 0) {
                var interval = window.setInterval(function() {
                    jnp.$overlay.trigger('click');
                    if (jnp.options.closeBtn)
                        jnp.$html.child.close.trigger('click');
                    window.clearInterval(interval);
                }, jnp.options.duration);
            }
        }

        /**
         *  Set where the notification bar is showed
         */
        var setPlace = function() {
            jnp.$wrapper = $('<div />').addClass(jnp._css + '-wrapper-position');
            if(jnp.options.css)
                jnp.$wrapper.addClass(jnp._css + '-custom');
            if(jnp.options.id != null)
                jnp.$wrapper.attr('id', jnp.options.id);
            switch(jnp.options.position) {
                case 'top':
                    jnp.$wrapper.css({
                        'position': 'absolute',
                        'z-index': '9999',
                        'top': 10,
                        'height': jnp.options.height,
                        'width': jnp.options.width,
                    });
                    jnp.$html.container.css({'margin': 0});
                    $('body').prepend(jnp.$wrapper);
                    jnp.$wrapper.prepend(jnp.$el);
                    // we dont put all in the same call because position change the context
                    jnp.$wrapper.css({
                        'left': (window.innerWidth - jnp.$el.outerWidth()) / 2,
                        'display': 'none'
                    });
                    break;
                case 'bottom':
                    jnp.$wrapper.css({
                        'position': 'absolute',
                        'z-index': '9998',
                        'bottom': 10,
                        'margin-bottom': 0,
                        'height': jnp.options.height,
                        'width': jnp.options.width,
                    });
                    jnp.$html.container.css({'margin': 0});
                    $('body').prepend(jnp.$wrapper);
                    jnp.$wrapper.prepend(jnp.$el);
                    // we dont put all in the same call because position change the context
                    jnp.$wrapper.css({
                        'left': (window.document.width - jnp.$el.outerWidth()) / 2,
                        'display': 'none'
                    });
                    break;
                case 'fancy':
                    jnp.$overlay = $('<div />').addClass(jnp._css + '-overlay');
                    jnp.$overlay.css({
                        'position': 'absolute',
                        'z-index': '9998',
                        'top': 0,
                        'left': 0,
                        'height': '100%',
                        'width': '100%',
                        'background-color': jnp.options.background,
                        'opacity': jnp.options.opacity,
                    });
                    jnp.$wrapper.height(jnp.options.height).width(jnp.options.width);
                    $('body').prepend(jnp.$wrapper);                    
                    jnp.$wrapper.prepend(jnp.$el);
                    jnp.$wrapper.css({
                        'position': 'absolute',
                        'z-index': '9999',
                        'height': jnp.options.height,
                        'width': jnp.options.width,
                    });
                    // we dont put all in the same call because position change the context                    
                    jnp.$wrapper.css({
                        'top': (window.innerHeight - jnp.$wrapper.outerHeight()) / 2,
                        'left': (window.innerWidth - jnp.$wrapper.outerWidth()) / 2,
                        'display': 'none'
                    });
                    break;
                default:                    
                    //insert the element checking the position in the DOM
                    if(jnp.$el.siblings().length > 1 && jnp.$el.index() > 0) {
                        var pos = jnp.$el.index() - 1;
                        jnp.$el.siblings().eq(pos).after(jnp.$wrapper);
                        jnp.$wrapper.prepend(jnp.$el).hide();
                    }
                    else {
                        jnp.$el.parent().prepend(jnp.$wrapper);                        
                    }
                    jnp.$wrapper.prepend(jnp.$el).hide();
                    
                    if(jnp.options.height != 'auto')
                        jnp.$html.container.height(jnp.options.height);

                    if(jnp.options.width != 'auto')
                        jnp.$html.container.width(jnp.options.width);
                    break;
            }
        }

        /**
         * Create the html to show alert message from bootstrap twitter classes
         */
        var buildBootstrap = function() {
            var contextual = 'alert';
            if(jnp.options.contextual != 'warning')
                contextual += ' alert-' + jnp.options.contextual;

            jnp.$html = {
                container: $('<div />').addClass(jnp._css + '-wrapper').addClass(contextual).addClass('alert-block'),                
                child: {
                    close: $('<button />').addClass('close').attr('button', 'button'),
                    title: $('<h4 />'),
                    message: $('<span />').addClass(jnp._css + '-message')
                }
            }
                       
            jnp.$el.prepend(jnp.$html.container);
            if (jnp.options.closeBtn) {
                jnp.$html.child.close.html('&times;');
                jnp.$html.container.append(jnp.$html.child.close);
            }
            if(jnp.options.title != null && jnp.options.title != '') {
                jnp.$html.child.title.append(jnp.options.title);
                jnp.$html.container.append(jnp.$html.child.title);
            }
            jnp.$html.child.message.append(jnp.options.message);
            jnp.$html.container.append(jnp.$html.child.message);
        }

        /**
         * Create the html to show alert message from bootstrap twitter classes
         */
        var buildDOM = function() {
            jnp.$html = {
                container: $('<div />').addClass(jnp._css + '-wrapper'),
                child: {
                    close: $('<div />').addClass(jnp._css + '-close'),
                    title: $('<h1 />').addClass(jnp._css + '-title'),
                    text: $('<p />').addClass(jnp._css + '-content').text(jnp.options.message),
                }
            }

            jnp.$el.prepend(jnp.$html.container);
            if(jnp.options.closeBtn) {
                jnp.$html.child.close.html('&times;');
                jnp.$html.container.append(jnp.$html.child.close);
            }
            if(jnp.options.title != null && jnp.options.title != '') {
                jnp.$html.child.title.append(jnp.options.title);
                jnp.$html.container.append(jnp.$html.child.title);
            }
            jnp.$html.container.append(jnp.$html.child.text);
        }

        /**
         * Create the html to show alert message from bootstrap twitter classes
         */
        var addStyles = function() {
            jnp.$html.container.css({
                'background': 'rgba(211, 209, 209, 0.933333)',
                'padding': '4px 35px 4px 12px',
                'margin-bottom': '20px',
                'text-shadow': '0 1px 0 rgba(255,255,255,0.5)',
                'border': '1px solid rgba(197, 197, 197, 0.95)',
                '-webkit-border-radius': '4px',
                '-moz-border-radius': '4px',
                'border-radius': '4px',
            });
            if(jnp.options.closeBtn) {
                jnp.$html.child.close.css({
                    'position': 'absolute',
                    'top': '10px',
                    'right': '10px',
                    'cursor': 'pointer',
                    'font-size': '22px'
                });
            }            
        }

        /**
         * Render the html code hidden
         */
        var render = function() {
            setEvents();
            if(jnp.options.position != 'wrapper')
                jnp.$overlay.show();
            jnp.$wrapper.show();
        }

        /**
         * Generate a event to render after a click in the wrapper
         */
        var renderLater = function() {
            $('#' + jnp.options.clickOn).off().on({
                click: function() {
                    render();
                }                    
            });
        }

        /**
         * We check the overlay after we change the message
         */
        var setOverlay = function () {
            if((jnp.options.position != 'fancy'))
                //It retains only leading numbers and discards all the rest. -> parseInt(string, radix)
                jnp.$overlay.height(jnp.$overlay.height() + parseInt(jnp.$overlay.css('padding-top'), 10) + parseInt(jnp.$overlay.css('padding-bottom'), 10));
        }

        return init(element, options);
    }

    $.fn.jnp = function(options) {

        args = Array.prototype.slice.call(arguments, 1);
        if(undefined != $(this).data("jnp") && undefined != $(this).data("jnp")[options]){
            // reload state from the element
            var jnp = $(this).data("jnp");
            // call public functions as $(element).jnp("publicFunction", args)
            return jnp[options].apply(this, args);
        }
        else {
            return this.each(function(){
                if(undefined == $(this).data("jnp") && (typeof options === "object" || ! options)) {
                    // create a new instance of jnp
                    var jnp = new $.jnp(this, options);
                    // in the jQuery version of the element
                    // store a reference to the plugin object
                    // you can later access the plugin and its methods and properties like
                    // element.data('pluginName').publicMethod(arg1, arg2, ... argn) or
                    // element.data('pluginName').settings.propertyName
                    $(this).data("jnp", jnp);

                }
                else {
                    $.error("Method " +  options + " does not exist in jQuery.jnp");
                }
            });
        }
    };

})( jQuery, window, document );