$(function () {
    var Titles = [];
    var Messages = [];
    var id = [];
    if ($StaticNotice != '')
    {
        Titles.push('전체 공지');
        Messages.push($StaticNotice);
	
    }
    if ($FlagNotice != '') {
        Titles.push('경고 공지');
        Messages.push($FlagNotice);

    }
    if ($LocalNotice != '') {
        Titles.push('체인점 공지');
        Messages.push($LocalNotice);

    }

    if (Titles.length > 0)
        $.Dialog.SequenceMessageBox(Titles, Messages);
});

function GoOrder() {
    $.ajax({
        url: HasCartUrl,
        type: 'POST',
        success: function (r) {
            if (r.toLowerCase() == 'true') {
                $.Dialog.QuestionBox('장바구니', '이전에 주문 중인 상품이 장바구니에 담겨져있습니다. 이 정보를 불러오시겠습니까?',
                    {
                        Text: '예',
                        Method: function () {
                            $.Dialog.Close();
                            window.location.href = CartUrl;
                        }
                    },
                    {
                        Text: '아니오',
                        Method: function () {
                            $.Dialog.Close();
                            $.ajax({
                                url: ClearCartUrl,
                                type: 'POST',
                                success: function (r) {
                                    if (r.toLowerCase() == 'true') {
                                        window.location.href = OrderUrl;
                                    }
                                    else {
                                        $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
                                    }
                                },
                                error: function () {
                                    $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
                                }
                            });
                        }
                    });
            }
            else {
                window.location.href = OrderUrl;
            }
        },
        error: function () {
            $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
        }
    });
}