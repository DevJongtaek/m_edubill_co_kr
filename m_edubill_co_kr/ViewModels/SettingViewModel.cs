using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace m_edubill_co_kr.ViewModels
{
    public class SettingViewModel
    {
        public List<String> VirtualAccounts { get; set; }
        public String Password { get; set; }
        public String PhoneNo { get; set; }
        public String Email { get; set; }
    }
}