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
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
;(function ( $, window, document, undefined ) {

    var pluginName = "JNP",
        defaults = {
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

    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options );

        this._defaults = defaults;
        this._name = pluginName;
        this._css = this._name.toLowerCase(); // css prefix
        this.init();
    }

    Plugin.prototype = {

        init: function() {
            var self = this;
            self.$el = $(this.element);            
            self.setOptions();
            self.draw();
            if(self.options.inmediatly) {
                self.render();
            }
            else if(self.options.time > 0) {
                var interval = window.setInterval(function() {
                    self.render();
                    window.clearInterval(interval);
                }, self.options.time);
            }
            if(self.options.clickOn){
                self.renderLater();
            }
        },

        /**
         * Avoid ugly parameters
         */
        setOptions: function() {
            this.options.bootstrap = this.setToBoolean(this.options.bootstrap);
            this.options.css = this.setToBoolean(this.options.css);
            this.options.inmediatly = this.setToBoolean(this.options.inmediatly);
            this.options.contextual = this.options.contextual.toLowerCase();
            this.options.contextual = $.inArray(this.options.contextual, ['warning', 'success', 'error', 'info']) ? this.options.contextual : 'warning';
            this.options.position = this.options.position.toLowerCase();
            this.options.position = $.inArray(this.options.position, ['wrapper', 'top', 'bottom', 'fancy']) ? this.options.position : 'wrapper';
            this.options.opacity = parseFloat(this.options.opacity);
            this.options.duration = parseFloat(this.options.duration) * 1000; // change to miliseconds
            this.options.time = parseFloat(this.options.time) * 1000; // change to miliseconds
            this.options.title = (typeof(this.options.title) == 'string') ? this.capitaliseFirstLetter(this.options.title) : null;
            this.options.height = (typeof(this.options.height) == 'number' || 
                typeof(this.options.height) == 'string') ? parseFloat(this.options.height) : 'auto';
            this.options.width = (typeof(this.options.width) == 'number' || 
                typeof(this.options.width) == 'string') ? parseFloat(this.options.width) : 'auto';
            this.options.closeBtn = this.setToBoolean(this.options.closeBtn);

            if(this.options.time > 0)
                this.options.inmediatly = false;

            this.options.id = (typeof(this.options.id) == 'string') ? this.options.id : null;
            if(this.options.id != null && this.options.id == this.$el.attr('id'))
                this.options.id += '-' + this._css;
        },

        /**
         * @return Boolean value
         */
        setToBoolean: function(value) {
            return (value == true || 
                    (typeof(value) == 'string' && value.toLowerCase() == 'true')  ||
                    value == '1' ||
                    value == 1) ? true : false;
        },

        capitaliseFirstLetter: function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        /**
         * Draw the HTML code
         */
        draw: function() {
            if(this.$el.prop("tagName").toLowerCase() == 'body') {
                this.$el = $('<div />').addClass(this._css + '-virtual-element');
                $('body').prepend(this.$el);
            }
            if (this.options.bootstrap)
                this.buildBootstrap();
            else
                this.buildDOM();            
            if (!this.options.bootstrap && !this.options.css)
                this.addStyles();
            this.setPlace();
            this.drawOverlay();            
        },

        drawOverlay: function() {
            this.$overlay = $('<div />').addClass(this._css + '-overlay');
            this.$overlay.css({
                'position': 'absolute',
                'z-index': '9998',
                'display': 'none',
                'left': 0,
                'top': this.options.position == 'bottom' ?  'auto' : 0,
                'bottom': this.options.position == 'bottom' ?  0 : 'auto'
            });
            if(!this.options.css) {
                this.$overlay.css({
                    'padding': this.options.position == 'fancy' ? 0 : '10px 0px',
                    'height': (this.options.position == 'fancy') ? '100%' : this.$wrapper.height(),
                    'width': '100%',
                    'background-color': this.options.background,
                    'opacity': this.options.opacity,
                });
            }

            $('body').prepend(this.$overlay);
            if(this.options.css)
                this.$overlay.addClass(this._css + '-custom');
        },

        /**
         * it creates events to handle
         */
        setEvents: function() {
            var self = this;
            
            // events to close fancy notification
            if (self.$overlay) {
                self.$overlay.one({
                    click: function() {
                        self.$overlay.fadeOut('slow', function() {
                            self.$overlay.hide();
                        });
                        self.$wrapper.fadeOut('slow', function() {
                            self.$wrapper.hide();
                        });
                    }                    
                });
                if (self.options.closeBtn) {
                    self.$html.child.close.one({
                        click: function() {
                            self.$overlay.fadeOut('slow', function() {
                                self.$overlay.hide();
                            });
                            self.$wrapper.fadeOut('slow', function() {
                                self.$wrapper.hide();
                            });
                        }                    
                    });
                }
            }

            if(this.options.duration > 0) {
                var interval = window.setInterval(function() {
                    self.$overlay.trigger('click');
                    if (self.options.closeBtn)
                        self.$html.child.close.trigger('click');
                    window.clearInterval(interval);
                }, this.options.duration);
            }
        },

        /**
         *  Set where the notification bar is showed
         */
        setPlace: function() {
            this.$wrapper = $('<div />').addClass(this._css + '-wrapper-position');
            if(this.options.css)
                this.$wrapper.addClass(this._css + '-custom');
            if(this.options.id != null)
                this.$wrapper.attr('id', this.options.id);
            switch(this.options.position) {
                case 'top':
                    this.$wrapper.css({
                        'position': 'absolute',
                        'z-index': '9999',
                        'top': 10,
                        'height': this.options.height,
                        'width': this.options.width,
                    });
                    this.$html.container.css({'margin': 0});
                    $('body').prepend(this.$wrapper);
                    this.$wrapper.prepend(this.$el);
                    // we dont put all in the same call because position change the context
                    this.$wrapper.css({
                        'left': (window.innerWidth - this.$el.outerWidth()) / 2,
                        'display': 'none'
                    });
                    break;
                case 'bottom':
                    this.$wrapper.css({
                        'position': 'absolute',
                        'z-index': '9998',
                        'bottom': 10,
                        'margin-bottom': 0,
                        'height': this.options.height,
                        'width': this.options.width,
                    });
                    this.$html.container.css({'margin': 0});
                    $('body').prepend(this.$wrapper);
                    this.$wrapper.prepend(this.$el);
                    // we dont put all in the same call because position change the context
                    this.$wrapper.css({
                        'left': (window.document.width - this.$el.outerWidth()) / 2,
                        'display': 'none'
                    });
                    break;
                case 'fancy':
                    this.$overlay = $('<div />').addClass(this._css + '-overlay');
                    this.$overlay.css({
                        'position': 'absolute',
                        'z-index': '9998',
                        'top': 0,
                        'left': 0,
                        'height': '100%',
                        'width': '100%',
                        'background-color': this.options.background,
                        'opacity': this.options.opacity,
                    });
                    this.$wrapper.height(this.options.height).width(this.options.width);
                    $('body').prepend(this.$wrapper);                    
                    this.$wrapper.prepend(this.$el);
                    this.$wrapper.css({
                        'position': 'absolute',
                        'z-index': '9999',
                        'height': this.options.height,
                        'width': this.options.width,
                    });
                    // we dont put all in the same call because position change the context                    
                    this.$wrapper.css({
                        'top': (window.innerHeight - this.$wrapper.outerHeight()) / 2,
                        'left': (window.innerWidth - this.$wrapper.outerWidth()) / 2,
                        'display': 'none'
                    });
                    break;
                default:                    
                    //insert the element checking the position in the DOM
                    if(this.$el.siblings().length > 1 && this.$el.index() > 0) {
                        var pos = this.$el.index() - 1;
                        this.$el.siblings().eq(pos).after(this.$wrapper);
                        this.$wrapper.prepend(this.$el).hide();
                    }
                    else {
                        this.$el.parent().prepend(this.$wrapper);                        
                    }
                    this.$wrapper.prepend(this.$el).hide();
                    
                    if(this.options.height != 'auto')
                        this.$html.container.height(this.options.height);

                    if(this.options.width != 'auto')
                        this.$html.container.width(this.options.width);
                    break;
            }
        },

        /**
         * Create the html to show alert message from bootstrap twitter classes
         */
        buildBootstrap: function() {
            var contextual = 'alert';
            if(this.options.contextual != 'warning')
                contextual += ' alert-' + this.options.contextual;

            this.$html = {
                container: $('<div />').addClass(this._css + '-wrapper').addClass(contextual).addClass('alert-block'),
                child: {
                    close: $('<button />').addClass('close').attr('button', 'button'),
                    title: $('<h4 />')
                }
            }
                       
            this.$el.prepend(this.$html.container);
            if (this.options.closeBtn) {
                this.$html.child.close.html('&times;');
                this.$html.container.append(this.$html.child.close);
            }
            if(this.options.title != null && this.options.title != '') {
                this.$html.child.title.append(this.options.title);
                this.$html.container.append(this.$html.child.title);
            }                
            this.$html.container.append(this.options.message);
        },

        /**
         * Create the html to show alert message from bootstrap twitter classes
         */
        buildDOM: function() {
            this.$html = {
                container: $('<div />').addClass(this._css + '-wrapper'),
                child: {
                    close: $('<div />').addClass(this._css + '-close'),
                    title: $('<h5 />').addClass(this._css + '-title'),
                    text: $('<p />').addClass(this._css + '-content').text(this.options.message),
                }
            }

            this.$el.prepend(this.$html.container);
            if(this.options.closeBtn) {
                this.$html.child.close.html('&times;');
                this.$html.container.append(this.$html.child.close);
            }
            if(this.options.title != null && this.options.title != '') {
                this.$html.child.title.append(this.options.title);
                this.$html.container.append(this.$html.child.title);
            }
            this.$html.container.append(this.$html.child.text);
        },
        
        /**
         * Create the html to show alert message from bootstrap twitter classes
         */
        addStyles: function() {
            this.$html.container.css({
                'background': 'rgba(240, 240, 240, 0.933333)',
                'padding': '4px 35px 4px 12px',
                'margin-bottom': '20px',
                'text-shadow': '0 1px 0 rgba(255,255,255,0.5)',
                'border': '1px solid rgba(197, 197, 197, 0.95)',
                '-webkit-border-radius': '4px',
                '-moz-border-radius': '4px',
                'border-radius': '4px',
            });
            if(this.options.closeBtn) {
                this.$html.child.close.css({
                    'position': 'absolute',
                    'top': '10px',
                    'right': '10px',
                    'cursor': 'pointer',
                    'font-size': '22px'
                });
            }            
        },

        /**
         * Render the html code hidden
         */
        render: function() {
            this.setEvents();
            if(this.options.position != 'wrapper')
                this.$overlay.show();
            this.$wrapper.show();
        },

        /**
         * Generate a event to render after a click in the wrapper
         */
        renderLater: function() {
            var self = this;
            $('#' + this.options.clickOn).off().on({
                click: function() {
                    self.render();
                }                    
            });
        }

    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );