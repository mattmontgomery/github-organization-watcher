requirejs.config({
    baseUrl: 'js',
    paths: {
        'jquery': '/vendor/jquery/dist/jquery',
        'hb': '/vendor/handlebars/handlebars',
    },
});
define(function(require) {
    var jquery = require('jquery'),
        hb = require('hb');

    var undo;
    // template compilation
    var source = $('#org_tpl').html(),
        template = Handlebars.compile(source);

    var $orglist = $('form .orglist');
    var OrgList = function($el) {
        var _l = {
            $el: null,
            init: function($el) {
                this.$el = $el;
            },
            get: function() {
                return $.map(this.$el.find('.org'), function(el) {
                    return el.value;
                });
            }
        };
        _l.init($el);
        return _l;
    };
    var ol = new OrgList($orglist);
    $('form').on('click', '.add', function(ev) {
        ev.preventDefault();
        var context = {};
        $orglist.append(template(context));
    }).on('submit', function(ev) {
        ev.preventDefault();
        $.ajax('/', {
            data: {
                orgs: ol.get()
            },
            type: 'PUT'
        });
    }).on('click','.close', function(ev) {
        var target = $(ev.currentTarget).parents('.organization');
        var value = target.find('input').val().replace('/\s/g','-');
        if(value !== undefined && value) {
            $.ajax('/' + value, {
                type: 'DELETE'
            }).done(function(){
                undo = target;
            });
        }
        target.detach();
    });
    $(document).on('keyup', function(ev) {
        if (undo && ev.keyCode == 90 && (ev.ctrlKey || ev.metaKey)) {
            $orglist.append(undo);
            undo = null;
        }
    });
});
