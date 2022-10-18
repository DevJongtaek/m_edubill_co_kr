using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace m_edubill_co_kr.ViewModels
{
    public class OrderListItem
    {
        public string OrderId { get; set; }
        public string OrderDate { get; set; }
        public string OrderAmt { get; set; }
        public string DeliveryDate { get; set; }
        public string vatflag { get; set; }

    }
}