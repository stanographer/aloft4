/** 
 * This is the Oaken Widgets jquery plugin.
 */
(function ($) {

    "use strict";

    var bsCol = 'div[class^=col-md-]';

    /**
     * Oaken Wigdet global settings.
     * We support only one container per page, thus we can use one settings object.
     */
    var settings;
    var $widgets;

    /** Default settings. */
    var defaults = {

        /** Enable/disable sortability. */
        sortable: true,

        /** Use this object to customize controls icons classes etc. */
        controlsConfig: {
            question: {
                iClassFirst: 'fa fa-question'
            },
            fullscreen: {
                iClassFirst: 'fa fa-expand',
                iClassSecond: 'fa fa-compress'
            },
            minmax: {
                iClassFirst: 'fa fa-chevron-up',
                iClassSecond: 'fa fa-chevron-down'
            },
            close: {
                iClassFirst: 'fa fa-times'
            }
        },

        /**
         * This setting allowes your to assign individual set of controls
         * to each widget. It should be an object where keys are your widgets ids
         * and values are strings with comma-separated desirable controls names.
         * For example, check this setting for widget with id 'myId':
         * {myId: 'question, fullscreen'}.
         */
        controlsMap: {},

        /**
         * Use this setting to specify which type of persistence you want to use for storing widget's
         * state across page reloads. When storing and restoring widget's state we rely on ids, so widgets must have ids
         * for this feature. There're two options: local to use localStorage and remote to use
         * http requests to server. If you don't want persistence at all, set this property to false.
         */
        persistence: 'local',

        /**
         * When you choose 'remote' presistence type, you should provide URL for requests for get, put and clear widgets data.
         * Widgets data is a string. You need to provide 3 endpoints to work with remote storage via remoteURL:
         * 1. GET http://{remoteURL} - should return widgets data
         * 2. POST http://{remoteURL} - will be used to store data
         * 3. DELETE http://{remoteURL} - will be used to clear storage
         */
        remoteURL: '/',

        /** This is a url to load content of the widget via ajax request. */
        ajaxLoad: '',

        /** Run before ajax request. this points to $widget. */
        ajaxStarted: function () {
            this.css('position', 'relative');
            spinStart(this);
        },

        /** Run after ajax request succeed. this should point to $widget. */
        ajaxCompleted: function (data) {
            if ($('.panel-body', this).length) {
                $('.panel-body', this).empty().html(data);
            } else {
                this.append($(data));
            }
            this.css('position', 'static');
            spinStop(this);
        },

        /** Run after ajax request failed. this should point to $widget. */
        ajaxFailed: function (errorCode) {
            this.css('position', 'static');
            spinStop(this);
            if (errorCode === 404) {
                this.append($('<p>404: Not Found</p>'));
            }
        }
    };
    // default settings END

    /**
     * Controls object describes the set of default oakenwidget controls,
     * which are buttons on the upper right corner of the widget.
     * Each control has it's specific appearence and behaviour which is triggered
     * on control click.
     */
    var controls = {



        /**
         * Fullscreen control is used to expand widget to occupy entire screen.
         */
        fullscreen: {

            /** HTML element's representing this control attributes. */
            attributes: {
                'class': 'btn-fullscreen oakenwidget-control'
            },

            /** This is what going to happen when control has been clicked. 'this' refers to control element. */
            behaviour: function (e) {

                var $widget = $(this).data('w'),
                    $controls = $('.oakenwidget-control', $widget),
                    initial;

                e.preventDefault();
                e.stopPropagation();

                $widget.toggleClass('panel-fullscreen');

                if ($widget.data('collapsed')) {
                    $('.panel-body', $widget).toggle($widget.is('.panel-fullscreen'));
                }

                var $columns = $widgets.find(bsCol);

                if ($widget.is('.panel-fullscreen')) {

                    initial = {
                        scroll: $(window).scrollTop(),

                        top: $widget.offset().top - $(window).scrollTop(),
                        left: $widget.offset().left,

                        width: $widget.width(),
                        height: $widget.height(),
                        position: $widget.css('position'),
                        'z-index': $widget.css('z-index')
                    };

                    $widget.css({
                        position: 'fixed',
                        top: initial.top,
                        left: initial.left,
                        width: initial.width,
                        height: initial.height,
                        'z-index': 999999

                    }).animate({
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0
                    }, 500, function () {

                        if (settings.sortable) {
                            $widgets.find(bsCol).sortable('destroy');
                        }

                        saveStructure();
                    })

                    .data('initial', initial);

                    $('body').css('overflow', 'hidden');

                } else {

                    initial = $widget.data('initial');

                    $widget.animate({
                        top: initial.top,
                        left: initial.left,
                        width: initial.width,
                        height: initial.height
                    }, 500, function () {
                        $widget.css({
                            position: initial.position,
                            'z-index': initial['z-index'],
                            width: initial.width,
                            height: initial.height
                        });
                        $(window).scrollTop(initial.scroll);
                        if (settings.sortable) {
                            $widget.css({
                                width: '100%',
                                height: 'auto'
                            });
                            initSortability();
                            $('body').css('overflow', 'auto');
                            saveStructure();
                        }
                    }).data('initial', void(0));

                }


                $controls.not(this).toggle();
                $(this).find('i')
                    .toggleClass(settings.controlsConfig.fullscreen.iClassFirst)
                    .toggleClass(settings.controlsConfig.fullscreen.iClassSecond);
            }
        },

        /**
         * MinMax control is used to show/hide widget's content.
         * When content is hidden, only heading is visible.
         */
        minmax: {

            /** HTML element's representing this control attributes. */
            attributes: {
                'class': 'btn-minmax oakenwidget-control'
            },

            /** This is what going to happen when control has been clicked. 'this' refers to control element. */
            behaviour: function (e) {
                e.preventDefault();
                e.stopPropagation();
                var $widget = $(this).data('w');
                $('i', $(this))
                    .toggleClass(settings.controlsConfig.minmax.iClassFirst)
                    .toggleClass(settings.controlsConfig.minmax.iClassSecond);
                $('.panel-body', $widget).slideToggle(function () {
                    $widget.data('collapsed', !$('.panel-body', $widget).is(':visible'));
                    saveStructure();
                });
            }
        },

        /**
         * Close control is used to remove widget from page, close it in the
         * terms of operating systems UIs windows.
         */
        close: {

            /** HTML element's representing this control attributes. */
            attributes: {
                'class': 'btn-close oakenwidget-control'
            },

            /** This is what going to happen when control has been clicked. 'this' refers to control element. */
            behaviour: function (e) {
                e.preventDefault();
                e.stopPropagation();
                var $widget = $(this).data('w');
                showConfirm('Delete widget', 'Are you sure?', function () {
                    $widget.fadeOut().remove();
                    saveStructure();
                });
            }
        }
    };
    // controls END

    /**
     * Oaken Widgets plugin definition.
     */
    $.fn.oakenwidgets = function (options) {

        if (this.length !== 1) {
            throw new Error("only one oakenwidgets container per page is supported");
        }

        var markupIsValid = false;
        if (this.is('.row')) {
            markupIsValid = true;

        } else {
            var childrenValid = true;
            this.children().each(function () {
                if (!$(this).is('.row')) {
                    childrenValid = false;
                    return;
                }
            });
            markupIsValid = childrenValid;
        }

        // check if this is a bs row or something containing rows and only rows
        if (!markupIsValid) {
            throw new Error("oakenwidgets must be a bs row or something containing rows and only rows");
        }

        settings = $.extend(defaults, options);

        $widgets = this;

        // Iterate over widgets.
        var controlsMap = settings.controlsMap;
        $widgets.find('.panel').each(function () {

            // This concrete widget.
            var $widget = $(this),
                widgetId = $widget.attr('id');

            // Create controls
            var $controlsContainer = $('<div class="pull-right"></div>'),
                $fix = $('<div class="clearfix"></div>');

            var attributeContolsMap = $widget.data('controls-map');
            if (typeof attributeContolsMap === 'string') {
                controlsMap[widgetId] = $widget.data('controls-map');
            }

            $.each(controls, function (name, definition) {

                if (typeof controlsMap[widgetId] === 'string' && controlsMap[widgetId].indexOf(name) === -1) {
                    return;
                }

                // appearence
                var $control = $('<a href="#"><i class="' + settings.controlsConfig[name].iClassFirst + '"></i></a>');
                $.each(definition.attributes, function (name, value) {
                    if (name === 'data-target') {
                        value = value.replace('{id}', widgetId);
                    }
                    $control.attr(name, value);
                });

                // behaviour
                $control.data('w', $widget);
                $control.click(definition.behaviour);

                $control.appendTo($controlsContainer);
            });

            var ajaxURL = $widget.data('ajax-load');
            if (ajaxURL) {
                if (typeof settings.ajaxStarted === 'function') {
                    settings.ajaxStarted.call($widget);
                }
                $.ajax({
                    method: 'GET',
                    url: ajaxURL,
                    success: function (data) {
                        if (typeof settings.ajaxCompleted === 'function') {
                            settings.ajaxCompleted.call($widget, data);
                        }
                    },
                    error: function (response) {
                        if (typeof settings.ajaxFailed === 'function') {
                            settings.ajaxFailed.call($widget, response.status);
                        }
                    }
                })
            }

            $('.panel-heading', $widget)
                .append($controlsContainer)
                .append($fix);
        });

        // sortability
        if (settings.sortable) {
            initSortability();
        }

        initConfirm();

        $widgets.show();
        initPersistence();

        return $widgets;
    };
    // plugin END

    /** Sortability */
    function initSortability() {
        var $columns = $widgets.find(bsCol);
        $columns.sortable({
            connectWith: $columns,
            placeholder: 'oaken-placeholder',
            start: function (e, ui) {
                ui.placeholder.height(ui.helper.outerHeight());
            },
            stop: function (e, ui) {
                saveStructure();
            },
            containment: $widgets,
            helper: 'clone',
            handle: '.panel-heading',
        });
    }
    // sortability END

    /** Persistence */
    function initPersistence() {
        $('.oaken-clear').click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            showConfirm('Clear Storage', 'Are you sure?', clearStructure);
        });
        getAndApplyStructure();
    }

    function getAndApplyStructure() {

        if (!settings.persistence) {
            return;
        }

        var structure = null;

        if (settings.persistence === 'local') {
            if (typeof window.localStorage === 'undefined') {
                console.error('localStorage is undefined, persistence features will not work.');
                return;
            }
            applyStructure(window.localStorage.getItem('oakenStructure'));

        } else if (settings.persistence === 'remote') {
            $.get(settings.remoteURL, applyStructure);
        }
    }

    function applyStructure(structureStr) {
        var structure = JSON.parse(structureStr);
        if (structure) {

            if (structure.order) {
                var order = structure.order;
                var $widgetz = $('.panel', $widgets).detach();
                $.each(order, function (i, col) {
                    var $col = $(bsCol, $widgets).eq(i);
                    $.each(order[i], function (j, widgetId) {
                        var id = widgetId.split(':')[0];
                        var min = widgetId.split(':')[1];
                        var $widget = $widgetz.filter('#' + id);
                        if (min && id !== structure.fullscreen) {
                            $('.panel-body', $widget).hide();
                            $('.panel-heading .btn-minmax i', $widget)
                                .removeClass(settings.controlsConfig.minmax.iClassFirst)
                                .addClass(settings.controlsConfig.minmax.iClassSecond);
                            $widget.data('collapsed', true);
                        }
                        $col.append($widget);
                    });
                });
            }

            if (structure.fullscreen) {
                var $fullscreenWidget = $('#' + structure.fullscreen);
                var initial = {
                    scroll: $(window).scrollTop(),
                    top: $fullscreenWidget.offset().top - $(window).scrollTop(),
                    left: $fullscreenWidget.offset().left,
                    width: $fullscreenWidget.width(),
                    height: $fullscreenWidget.height(),
                    position: $fullscreenWidget.css('position'),
                    'z-index': $fullscreenWidget.css('z-index')
                };
                $fullscreenWidget.css({
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        'z-index': 999999,
                        width: '100%',
                        height: '100%'
                    })
                    .data('initial', initial)
                    .addClass('panel-fullscreen');
                $('.oakenwidget-control', $fullscreenWidget).not('.btn-fullscreen').toggle();
                $('.btn-fullscreen', $fullscreenWidget).find('i')
                    .toggleClass(settings.controlsConfig.fullscreen.iClassFirst)
                    .toggleClass(settings.controlsConfig.fullscreen.iClassSecond);
            }
        }
    }

    function saveStructure() {

        if (!settings.persistence) {
            return;
        }

        var structure = {};

        if ($('.panel-fullscreen').length === 1) {
            structure.fullscreen = $('.panel-fullscreen').attr('id');
        } else {
            delete structure.fullscreen;
        }

        var order = [];
        if ($widgets.is('.row')) {
            $(bsCol, $widgets).each(function () {
                var $col = $(this);
                var colWidgets = [];
                $('.panel', $col).each(function () {
                    var id = $(this).attr('id');
                    if ($(this).data('collapsed')) {
                        id += ':min';
                    }
                    colWidgets.push(id);
                });
                order.push(colWidgets);
            });
        }
        structure.order = order;

        if (settings.persistence === 'local') {

            if (typeof window.localStorage === 'undefined') {
                return;
            }

            window.localStorage.setItem('oakenStructure', JSON.stringify(structure));

        } else if (settings.persistence === 'remote') {
            $.post(settings.remoteURL, {
                structure: JSON.stringify(structure)
            });
        }
    }

    function clearStructure() {
        if (!settings.persistence) {
            return;
        }
        if (settings.persistence === 'local') {

            if (typeof window.localStorage === 'undefined') {
                return;
            }

            window.localStorage.removeItem('oakenStructure');
            window.location.reload();

        } else if (settings.persistence === 'remote') {
            $.ajax({
                type: 'DELETE',
                url: settings.remoteURL,
                success: function () {
                    window.location.reload();
                }
            });
        }
    }
    // persistence END

    /** Confirmation modal */
    function initConfirm() {
        var html = '<div class="modal modal-danger-filled oaken-confirm" data-easein="bounceIn" data-easeout="bounceOut" tabindex="-1" role="dialog" aria-hidden="true">' +
            '<div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header">' +
            '<h4 class="modal-title"></h4></div><div class="modal-body"><span></span></div>' +
            '<div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Cancel' +
            '</button><button type="button" class="btn btn-default accept">OK</button></div></div></div></div>';
        $('body').append($(html));
    }

    function showConfirm(title, body, acceptCallback) {
        var $confirm = $('.oaken-confirm');
        $confirm.find('.modal-title').text(title);
        $confirm.find('.modal-body span').text(body);
        $confirm.find('.accept').off('click.oaken').on('click.oaken', function () {
            acceptCallback();
            $confirm.modal('hide');
        });
        $confirm.modal('show');
    }
    // confirmation modal END

    /** Spinner */
    function spinStart($widget) {
        var $spinnerContainer;
        if ($('.panel-body', $widget).length) {
            $spinnerContainer = $('.panel-body', $widget);
        } else {
            $spinnerContainer = $widget;
        }
        $spinnerContainer.append('<div class="ow-veil"><span class="ow-spinner"><i class="glyphicon glyphicon-refresh ow-rotate"></i></span></div>');
    }

    function spinStop($widget) {
        $('.ow-veil', $widget).remove();
    }

    /** Debug output */
    function d(msg) {
        console.log('OW: ' + msg);
    }

})(jQuery);