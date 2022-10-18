function Update() {
    var $Password = $('#iPassword').val();
    var $PhoneNo = $('#iPhoneNo').val();
    var $Email = $('#iEmail').val();
    $.ajax({
        url:UpdateUrl,
        type:'POST',
        data: { Password: $Password, PhoneNo: $PhoneNo, Email: $Email },
        success: function(){
            $.Dialog.NavigationBox('수정 확인', '수정이 완료되었습니다.', {Text:'확인', Method: function(){ window.location.href=HomeUrl; }});
          },
      });
    //$.form(UpdateUrl, { Password: $Password, PhoneNo: $PhoneNo, Email: $Email }).submit();
}