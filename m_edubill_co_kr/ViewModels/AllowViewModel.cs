using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace m_edubill_co_kr.ViewModels
{
    public class AllowViewModel
    {
        private bool _IsAllowed = false;

        public bool IsAllowed
        {
            get { return _IsAllowed; }
            set { _IsAllowed = value; }
        }

        private bool _IsMyFlag = false;

        public bool IsMyFlag
        {
            get { return _IsMyFlag; }
            set { _IsMyFlag = value; }
        }


        private string _Message = "";

        public string Message
        {
            get { return _Message; }
            set { _Message = value; }
        }
    }
}