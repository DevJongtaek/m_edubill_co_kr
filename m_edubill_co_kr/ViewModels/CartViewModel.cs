using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace m_edubill_co_kr.ViewModels
{
    public class CartViewModel
    {
        public int Yeosin { get; set; }
        public int Misu { get; set; }
        public int Current { get; set; }
        public List<CartItem> CartItems { get; set; }
        public string myflag { get; set; }
        public string myflag_select { get; set; }

        public string d_requestday { get; set; }
        public string wdate { get; set; }

        public string vatflag { get; set; }

        public int MinOrderAmt { get; set; }

        public string MinOrderCheck { get; set; }


        public int ordercnt { get; set; }

    }
}