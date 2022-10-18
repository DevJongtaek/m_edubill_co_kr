using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace m_edubill_co_kr.ViewModels
{
    public class Product
    {
        public int ProductId { get; set; }
        public String Code { get; set; }
        public String Name { get; set; }
        public Decimal Price { get; set; }
        public String Unit { get; set; }
        public String GroupCode { get; set; }
        public bool IsOut { get; set; }
        public bool NotWeek { get; set; }
        public String ThumbnailPath { get; set; }
    }
}