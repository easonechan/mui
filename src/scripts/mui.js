(function ($) {

    //默认参数。
    var defaluts = {

    };

    $.fn.extend({
        //转换ui
        "muiRender": function (options) {

            var opts = $.extend({}, defaluts, options);

            checkboxRender(this.find(':checkbox'));
            breadcrumbRender(this);
            menuRender(this);
            inputTxtRender(this);
            selectRender(this);
            tableRender(this);
            pagerRender(this);
            radioRender(this);
            formitemRender(this);
            return this;
        },
        //设置自定义的事件。
        "setEvent": function (package) {
            var eventEls = $('*[' + mui_event + ']');
            var that = this;
            eventEls.each(function (i, item) {
                var el = $(this);
                var elFun = $(this).attr(mui_event);//要绑定的方法名称。


                if (elFun == '') return true;

                var elType = el.attr('mui-event-type');
                switch (elType) {
                    case 'hover':
                        el.hover(function () {

                            let fun = elFun.replace(/\)/g, 'true)');

                            eval('package.' + fun);
                        },
                            function () {
                                let fun = elFun.replace(/\)/g, 'false)');

                                eval('package.' + fun);
                            })

                        break;
                    default:
                        el.on('click', function () {
                            eval('package.' + elFun);
                        });
                        break;
                }//end switch
            })//end eventEls
        }

    });

    const mui_event = 'mui-event';

    /**
     * 渲染表格。
     * @param {any} obj
     */
    function tableRender(obj) {
        //渲染表格
        var tables = obj.find('table[mui-render="true"]');


        //添加样式表div 外包。
        tables.addClass('mui-table')
            .attr('cellspacing', '0').attr('cellpadding', '0').attr('border', '0')
            .wrap('<div class="mui-table-box"><div class="mui-table-main"></div></div>');

        tables.each(function (i, item) {
            if ($(this).find('tbody>tr').length == 0) {

                //添加空白数据提示
                var msg = $(this).attr('mui-msg');
                if (msg == null) msg = '没有数据。';
                var tdcount = $(this).find('thead>tr>th').length;
                var newRow = $('<tr><td colspan="' + tdcount + '">' + msg + '</td></tr>');
                $(this).children('tbody').append(newRow);
            }

            table_checkall(item);
        });
    }

    /**
     * 表格全选。
     * */
    function table_checkall(table) {
        var checkalls = $(table).find('thead>tr>th[mui-behavior="checkall"]');
        checkalls.each(function () {

            //全选的索引 
            let index = $(this).index();

            let cb = $('<input type="checkbox" />');
            $(this).append(cb);
            cb.click([table,index],table_checkall_click);
            checkbox_item_render(cb);
          
        })          
    }
    /**
     * 表格全选事件。
     * @param {any} event
     */
    function table_checkall_click(event) {
        let isChecked = $(this).is(':checked');
        var index = event.data[1];
        var table = event.data[0];


        $(table).find('tbody>tr').each(function () {
            let row = $(this);
            let td = row.children('td').get(index); 
            $(td).children('div[mui-type="checkbox_place"]').click();
        });          
    }

    /**
     * 表单项渲染。 
     * @param {any} obj
     */
    function formitemRender(obj) {
        var forms = obj.find('*[mui-render="true"][mui-type="mui-form"]')
            .addClass('mui-form');


        forms.each(function (i, form) {

            let isVertical = $(form).attr('vertical') == undefined ? false : eval($(form).attr('vertical'));//是否垂直布局
            var labelWidth = $(form).attr('label-width');
             
             

            var formItems = $(form).children();
            //二级可能为其它元素（如form），再次获取赋值 。
            if (!formItems.is('div')) formItems = formItems.children('div');
            formItems.addClass('mui-form-item')

            if (!isVertical) {
                var inlines = formItems.children().addClass('mui-inline');
                //console.log(inlines.length);
                var labels = inlines.children('label').addClass('mui-form-label');
                if (labelWidth != undefined) {
                    labels.css('width', labelWidth);
                }
                inlines.children('div').addClass('mui-input-inline');
            }
            else {
                formItems.children('label').addClass('col-md-2 control-label'); 
            }
        });



    }



    /**
     * 渲染菜单。
     * @param {any} obj 
     */
    function menuRender(obj) {

        //树型菜单处理
        var menus = obj.find('*[mui-render="true"][mui-type="menu"]');
        menus.each(function () {
            menuItemRender($(this));
        })


    }
    function menuItemRender(menus) {
        var defaultHome = menus.attr('mui-data');

        var home = JSON.parse(defaultHome);


        menus.find('li>a').click(function (i) {

            //判断是处于激活状态，如果不是隐藏子项。
            var item = $(this).parent();

            var isSelected = item.is('.mui-nav-itemed')
            if (isSelected) {
                item.removeClass('mui-nav-itemed');
                return;
            };

            //查找激活的菜单，变成隐藏状态。
            menus.children('li.mui-nav-itemed').removeClass('mui-nav-itemed');
            item.addClass('mui-nav-itemed');

        })

        var lastTreeItem;
        menus.find('li>dl>dd>a').each(function () {
            let href = $(this).attr('href');
            $(this).removeAttr('href');
            $(this).attr('mui-href', href);

            $(this).click(function () {
                if (lastTreeItem != null) { lastTreeItem.removeClass('mui-this'); }
                lastTreeItem = $(this).parent();
                $(this).parent().addClass('mui-this');
                document.getElementById('rightFrame').contentWindow.location.href = $(this).attr('mui-href');

                //添加到面包屑
                bind_menuItem($(this), home);
                breadcrumbRender_html();

            })
        })
    }

    var breadcrumbs;
    var breadcrumbData = new Array();//面包屑数据项。

    /**
     * 绑定菜单项到面包屑。 
     */
    function bind_menuItem(treeItem, home) {
        breadcrumbData.splice(0, breadcrumbData.length);

        var parentMenu = treeItem.parent().parent().siblings(':first');

        if (home == null)
            breadcrumbData.push({ label: '首页', href: '/', last: false });
        else
            breadcrumbData.push(home);
        setBreadcrumbItem(parentMenu, false);
        setBreadcrumbItem(treeItem, true);
    }

    /**
     * 设置面包屑数据项。 
     */
    function setBreadcrumbItem(item, lastItem) {
        let href = item.attr('mui-href') == undefined ? item.attr('href') : item.attr('mui-href');
        breadcrumbData.push({ label: item.text(), href: href, last: lastItem });
    }
    /**
     * 渲染面包屑。
     */
    function breadcrumbRender(obj) {
        breadcrumbs = obj.find('*[mui-render="true"][mui-type="breadcrumb"]');
        breadcrumbs.addClass('mui-breadcrumb');
    }
    /**
     * 渲染面包屑。
     */
    function breadcrumbRender_html() {

        breadcrumbs.empty();
        breadcrumbData.forEach(element => {

            var breadcrumbItem;
            if (!element.last)
                breadcrumbItem = $(`<span><a href="${element.href}" target="rightFrame" class="mui-breadcrumb-item-link">${element.label}</a> <span class="mui-breadcrumb-item-separator">/</span></span>`);
            else
                breadcrumbItem = $(`<span>${element.label} <span class="mui-breadcrumb-item-separator">/</span></span>`);

            breadcrumbs.append(breadcrumbItem);
        });
    }

    /**
     * 渲染分页。
     * @param {any} obj 
     */
    function pagerRender(obj) {
        var pagers = obj.find('div[mui-render="true"][mui-type="pager"]')
            .wrap('<div class="mui-table-page"><div class="mui-box mui-laypage mui-laypage-default"></div></div>');
    }

    const select_option_selected_class = 'mui-select-tips mui-this';

    /**
     * 渲染checkbox
     * @param {any} obj
     */
    function checkboxRender(obj) {
        var cbxs = obj.each(function () {
            var cb = $(this);
            checkbox_item_render(cb);
        })
    }
    function checkbox_item_render(cb) {
       
        cb.hide();

        var title = cb.attr('title') == undefined ? '' : cb.attr('title');
        var placeEl = $('<div mui-type="checkbox_place" class="mui-unselect mui-form-checkbox" skin="primary"><span>' + title + '</span><i class="mui-icon mui-icon-ok"></i></div>');
        cb.parent().append(placeEl);
        placeEl.click(function () {

            cb.click(); 
            let isChecked = cb.is(':checked');
            //cb.prop("checked", !isChecked);

            if (!isChecked) {
                placeEl.removeClass('mui-form-checked');
            }
            else
                placeEl.addClass('mui-form-checked');
        })
    }


    /**
     * 渲染单选。
     * @param {any} obj
     */
    function radioRender(obj) {
        //radio渲染
        var radios = obj.find('*[mui-render="true"],[mui-type="radio"]').children('input[type="radio"]');

        let radio_selected_class = 'mui-form-radioed';

        radios.each(function () {

            //是否选中。
            var isSelect = $(this).attr('checked') != undefined;

            //mui-value="' + $(this).val() + '"
            let radioWrap = $('<div mui-value="' + $(this).val() + '" mui-radio-name="' + $(this).attr('name') + '"  class="mui-unselect mui-form-radio ' + (isSelect ? radio_selected_class : '') + '"></div>');
            let title = $(this).attr('title') == undefined ? '' : $(this).attr('title');

            let radioItem = $('<i class="mui-anim mui-icon mui-icon-circle"></i><div>' + title + '</div>');//' + _class + '
            radioWrap.append(radioItem);


            //选择事件
            radioWrap.click(function () {
                $(this).siblings().removeClass(radio_selected_class);
                $(this).addClass(radio_selected_class);

                let selectVal = $(this).attr('mui-value');
                let selectRadioName = $(this).attr('mui-radio-name');


                let radiogroup = $("input[name='" + selectRadioName + "']");
                radiogroup.attr("checked", false);
                radiogroup.filter("[value='" + selectVal + "']").attr("checked", true);

            })

            $(this).after(radioWrap);
        })
    }

    /**
     * 渲染select
     * @param {any} obj
     */
    function selectRender(obj) {
        var selects = obj.find('select');

        selects.each(function (i, item) {


            $(item).on('DOMNodeInserted', function () {
                selectRender_item(item);
            })

            selectRender_item(item);
        })
    }

    /**
     * select单项生成。
     * @param {any} source
     */
    function selectRender_item(source) {
        var select = $(source);
        select.hide();

        //查找是否已经生成过渲染。
        //如果已经生成，删除该渲染。此方法不是最好，以后改成替换元素来进行。
        var temp1 = select.siblings().last('[mui-render-append="true"]');
        temp1.remove();

        var title = select.attr('title') == undefined ? '' : select.attr('title');
        var placeEl = $('<div mui-render-append="true" class="mui-unselect mui-form-select"></div>');
        placeEl.append('<div class="mui-select-title"></div>');

        //显示的下拉文本。
        var placeInput = $('<input type="text" placeholder="----" value="" readonly="" class="mui-input mui-unselect"><i class="mui-edge"></i>');

        //查找默认值并赋于默认文本。
        placeInput.val(select.find("option:selected").text());

        placeEl.append(placeInput);

        var selectWrap = $('<dl class="mui-anim mui-anim-upbit" > </dl>');

        //生成数据项。
        var selectOptions = select.children('option');
        selectOptions.each(function (i, item) {
            var isSelect = $(this).attr('selected') != undefined;
            var newOption = $('<dd mui-value="' + $(this).val() + '" class="">' + $(this).text() + '</dd>');
            if (isSelect) newOption.addClass(select_option_selected_class);
            selectWrap.append(newOption);

            //选中时候触发。
            newOption.click(function () {
                $(this).siblings().removeClass(select_option_selected_class);
                $(this).addClass(select_option_selected_class);
                placeInput.val($(this).text());

                // select.val($(this).attr('mui-value'));
                select.find('option[value="' + $(this).attr('mui-value') + '"]').prop("selected", true);
                selectWrap.hide();
            });
        });


        placeEl.append(selectWrap);
        select.parent().append(placeEl);



        placeInput.click(function () {
            selectWrap.stop();
            if (selectWrap.is(':hidden')) {
                selectWrap.fadeIn();
                placeEl.addClass('mui-form-selected');
            }
            else {
                selectWrap.fadeOut();
                placeEl.removeClass('mui-form-selected');
            }
        });
    }
    /**
     * 渲染文本输入
     * @param {any} obj
     */
    function inputTxtRender(obj) {
        var inputs = obj.find(':input[type="text"],:input[type="number"],:input[type="password"]');
        inputs.addClass('mui-input');
    }
})(jQuery);