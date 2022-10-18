using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace m_edubill_co_kr.ViewModels
{
    public class CartItem
    {
        public int Id { get; set; }
        public String ProductCode { get; set; }
        public long ProductPrice { get; set; }
        public int Count { get; set; }
        public String ProductName { get; set; }
        public String ProductUnit { get; set; }
        public bool HasTax { get; set; }
        public int Tax { get; set; }
        public long Amt { get; set; }
        public String request_day { get; set; }

        public int NewTax { get; set; }
        public long NewAmt { get; set; }
    }
}