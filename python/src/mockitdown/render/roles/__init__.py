"""The role families of the HTML renderer: one mixin class per family, each holding the
``r_<role>`` methods of its roles. :class:`mockitdown.render.html.Renderer` inherits them all."""

from __future__ import annotations

from .layout import LayoutRoles
from .content import ContentRoles
from .controls import ControlRoles
from .navigation import NavigationRoles
from .containers import ContainerRoles
from .components import ComponentRoles
from .annotations import AnnotationRoles

__all__ = ["LayoutRoles", "ContentRoles", "ControlRoles", "NavigationRoles", "ContainerRoles", "ComponentRoles", "AnnotationRoles"]
