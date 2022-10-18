using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace m_edubill_co_kr.ViewModels
{
    public class OrderDetialViewModel
    {
        public String OrderId { get; set; }
        public String CompanyName { get; set; }
        public String CompanyCode { get; set; }
        public String OrderDate { get; set; }
        public String OrderAmt { get; set; }
        public bool AllowEdit { get; set; }
        public List<CartItem> CartItems { get; set; }
        public String myflag { get; set; }
        public String myflag_select { get; set; }

        public String d_requestday { get; set; }
        public String request_day { get; set; }

        public String vatflag { get; set; }
    }
}