(function ($) {
    $.fn.extend({
        //转换ui
        "muiRender": function () {
            checkboxRender(this.find(':checkbox'));
            inputTxtRender(this);
            selectRender(this);
            tableRender(this);
            pagerRender(this);
            radioRender(this);
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

    function tableRender(obj) {
        //渲染表格
        var tables = obj.find('table[mui-render="true"]');
              

        //添加样式表div 外包。
        tables.addClass('mui-table')
            .attr('cellspacing', '0').attr('cellpadding', '0').attr('border', '0')
            .wrap('<div class="mui-table-box"><div class="mui-table-main"></div></div>');
    }

    function pagerRender(obj) { 
        var pagers = obj.find('div[mui-render="true"][mui-type="pager"]')
            .wrap('<div class="mui-table-page"><div class="mui-box mui-laypage mui-laypage-default"></div></div>');
    }

    const select_option_selected_class = 'mui-select-tips mui-this';

    /**
     * 解析checkbox
     * @param {any} obj
     */
    function checkboxRender(obj) {
        var cbxs = obj.each(function () {
            var cb = $(this);
            cb.hide();

            var title = cb.attr('title') == undefined ? '' : cb.attr('title');
            var placeEl = $('<div class="mui-unselect mui-form-checkbox" skin="primary"><span>' + title + '</span><i class="mui-icon mui-icon-ok"></i></div>');
            cb.parent().append(placeEl);
            placeEl.click(function () {

                let isChecked = cb.is(':checked');
                cb.prop("checked", !isChecked);

                if (isChecked) {
                    placeEl.removeClass('mui-form-checked');
                }
                else
                    placeEl.addClass('mui-form-checked');
            })
        })
    }


    /**
     * 单选渲染。
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

        selects.each(function (i,item) {
           

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
     * 解析文本输入
     * @param {any} obj
     */
    function inputTxtRender(obj) {
        var inputs = obj.find(':input[type="text"],:input[type="number"]');
        inputs.addClass('mui-input');
    }
})(jQuery);