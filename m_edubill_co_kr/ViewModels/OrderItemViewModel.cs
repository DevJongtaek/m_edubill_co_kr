using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace m_edubill_co_kr.ViewModels
{
    public class OrderItemViewModel
    {
        public List<ProductGroup> ProductGroups { get; set; }
        public List<Product> Products { get; set; }
    }
}