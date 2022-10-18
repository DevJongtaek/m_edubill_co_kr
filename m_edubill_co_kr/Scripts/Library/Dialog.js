var IsBlocked = true;
(function ($) {
    $.Dialog = {
        Alert: function (Message) {
            return $.Dialog._Create('알림', Message, []);
        },
        MessageBox: function (Title, Message) {
            return $.Dialog._Create(Title, Message, []);
        },
        NavigationBox: function (Title, Message, Button) {
            return $.Dialog._Create(Title, Message, [Button]);
        },
        QuestionBox: function (Title, Message, oLeftButton, oRightButton)
        {
            return $.Dialog._Create(Title, Message, [oLeftButton, oRightButton]);
        },

        QuestionBox2: function (Title, Message, oLeftButton) {
            return $.Dialog._Create(Title, Message, oLeftButton);
        },
        SequenceMessageBox: function (Titles, Messages) {
            return $.Dialog._SequenceMessageBox(Titles, Messages, 0);
        },
        Close: function () {
            $('#AlertDialog').popup('close');
        },
        _SequenceMessageBox: function (Titles, Messages, id) {
            var nId = id + 1;
            if (nId < Messages.length) {
                return this._Create(Titles[id], Messages[id], [], function () {
                    $.Dialog._SequenceMessageBox(Titles, Messages, nId);
                });
            }
            else {
                return $.Dialog._Create(Titles[id], Messages[id], []);
            }
        },
        _Create: function (Title, Message, Buttons, AfterClose) {
            var oDialog = $('<div id="AlertDialog"></div>').addClass('ui-mini');
            var oTitle = $('<div></div>').addClass('ui-title').append($('<span></span>').addClass('font-bold').html(Title));
            var oContent = $('<div></div>').addClass('ui-content').append($('<span></span>').addClass('ui-message').html(Message));
            var oButtons = $('<div></div>').addClass('ui-buttons');
            if (Buttons.length == 0)
            {
              	oButtons.append($('<a></a>').addClass('ui-btn').html('확인').on('click', function ()
                {
                    $('#AlertDialog').popup('close');
                }));
            }
            else if (Buttons.length == 1)
            {
                oButtons.append($('<a></a>').addClass('ui-btn').html(Buttons[0].Text).click(function () {
                    Buttons[0].Method();
                    $('#AlertDialog').popup('close');
                }));
            }
            else if (Buttons.length == 2) {
                var oButtonContainer = $('<div></div>').addClass('ui-grid-a');
                $('<a></a>').addClass('ui-btn').html(Buttons[0].Text).click(function () {
                    Buttons[0].Method();
                }).appendTo($('<div></div>').addClass('ui-block-a').appendTo(oButtonContainer));
                $('<a></a>').addClass('ui-btn').addClass('ui-dialog-right-btn').html(Buttons[1].Text).click(function () {
                    Buttons[1].Method();
                }).appendTo($('<div></div>').addClass('ui-block-b').appendTo(oButtonContainer));
                oButtons.append(oButtonContainer);
            }
            oDialog.append(oTitle).append(oContent).append(oButtons);
		setTimeout(function(){
            oDialog.appendTo($.mobile.activePage).popup({
                afterclose: function (event, ui) {
                    $(this).remove();
                    if (AfterClose)
                        AfterClose();
                },
                dismissible: false,
            }).popup('open');}, 500);
            //oDialog.appendTo('body').popup({
            //    afterclose: function (event, ui) {
            //        $(this).remove();
            //        if (AfterClose)
            //            AfterClose();
            //    },
            //    dismissible: true,
            //}).popup('open');

            return oDialog;

        },
        
}
})(jQuery);