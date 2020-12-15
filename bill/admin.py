import csv
import datetime

from django.contrib import admin
from django.urls import reverse
from django.http import HttpResponse
from django.utils.safestring import mark_safe

from bill.models import (
    Order,
    Product,
    OrderItem
)

def export_to_csv(modeladmin, request, queryset):
    opts = modeladmin.modle._meta
    response = HttpResponse(content_type = 'text/csv')
    response['Content-Disposition'] = 'attachment;filename={}.csv'.format(opts.verbose_name)
    writer = csv.writer(response)

    fields = [field for field in opts.get_fields() if not field.many_ro_many and not field.one_to_many]

    writer.writerow([field.verbose_name for field in fields])

    for obj in queryset:
        data_row = []
        for field in fields:
            value = getattr(obj, field.name)
            if isinstance(value, datetime.datetime):
                value = value.strftime("%Y-%m-%d")
            data_row.append(value)
        writer.writerow(data_row)
    return response
export_to_csv.short_description = 'Export to CSV'

def order_detail(obj):
    return mark_safe('<a href="{}">Detail</a>'.format(reverse('orders:admin_order_detail', args=[obj.id])))

def order_pdf(obj):
    return mark_safe('<a href="{}">PDF</a>'.format(reverse('orders:admin_order_pdf', args=[obj.id])))

order_pdf.short_description = 'PDF'

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product']

class OrderAdmin(admin.ModelAdmin):
    list_disply = ['id', 'email', 'paid', order_detail, order_pdf, 'created_at', 'updated_at']
    list_filter = ['paid', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    actions = [export_to_csv]

admin.site.register(Order, OrderAdmin)
admin.site.register(Product)