using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace m_edubill_co_kr.ViewModels.Accounts
{
    public class LoginViewModel
    {
        public String LoginID { get; set; }
        public String Password { get; set; }
        public bool SaveId { get; set; }
        public bool RemainSession { get; set; }
    }
}