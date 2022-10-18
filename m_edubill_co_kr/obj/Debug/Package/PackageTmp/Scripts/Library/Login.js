$(function () {
    if (ShowError == 'True')
{
	//setTimeout(fnShowError, 1000);
        $.Dialog.Alert('가맹점코드 또는 비밀번호가 틀립니다. 확인 후, 다시 입력 바랍니다.<br> 비밀번호(숫자 2자리)는 기존 인터넷/ARS에서 사용하셨던 번호(모르시면 입력 안 함)를 그대로 입력하시면 됩니다.<br> ☎ 문의전화 : (02)853-5111');
	//alert($('#AlertDialog').html());
}
});
function fnShowError(){
        $.Dialog.Alert('가맹점코드 또는 비밀번호가 틀립니다. 확인 후, 다시 입력 바랍니다.');
}
function Submit() {

    var $LoginID = $('#LoginID').val();
    if ($LoginID.length != 8) {
        $.Dialog.Alert('가맹점 코드 8자를 입력해주세요.')
        return;
    }
    $.ajax(
        {
            url: IsServiceUrl,
            type: 'POST',
            data: {
                LoginID: $LoginID,
                Password: $('#Password').val(),
                SaveId: $('#SaveId').is(':checked'),
                RemainSession: $('#RemainSession').is(':checked')
            },
            success: function (r) {
                if (r.IsSuccess) {
                    $.form(LoginUrl,
                    {
                        LoginID: $LoginID,
                        Password: $('#Password').val(),
                        SaveId: $('#SaveId').is(':checked'),
                        RemainSession: $('#RemainSession').is(':checked')
                    }).submit();
                }
                else {
                    $.Dialog.Alert('현재 서비스가 일시 정지된 상태입니다. 체인본사로 문의 바랍니다.');
                }

            },
            error: function () {
                $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
            },
        });

}