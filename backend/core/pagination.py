"""
Custom pagination classes for HandyGH.

Design Decisions:
- Standardized pagination response format
- Configurable page size with limits
- Include metadata for client-side pagination UI
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination class with consistent response format.
    
    Response format:
    {
        "success": true,
        "data": [...],
        "meta": {
            "pagination": {
                "page": 1,
                "page_size": 20,
                "total_pages": 5,
                "total_count": 100,
                "has_next": true,
                "has_previous": false
            }
        }
    }
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        """
        Return paginated response with metadata.
        
        Args:
            data: Serialized data for current page
            
        Returns:
            Response with pagination metadata
        """
        return Response({
            'success': True,
            'data': data,
            'meta': {
                'pagination': {
                    'page': self.page.number,
                    'page_size': self.page_size,
                    'total_pages': self.page.paginator.num_pages,
                    'total_count': self.page.paginator.count,
                    'has_next': self.page.has_next(),
                    'has_previous': self.page.has_previous(),
                }
            }
        })


class LargeResultsSetPagination(PageNumberPagination):
    """
    Pagination class for large datasets.
    
    Uses larger page size for better performance with large lists.
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200
    
    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'data': data,
            'meta': {
                'pagination': {
                    'page': self.page.number,
                    'page_size': self.page_size,
                    'total_pages': self.page.paginator.num_pages,
                    'total_count': self.page.paginator.count,
                    'has_next': self.page.has_next(),
                    'has_previous': self.page.has_previous(),
                }
            }
        })
