"""Endpoints de perfiles de proyecto (§4.6 y §9 de definicion-inicial.md)."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_session
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
def list_projects(db: Session = Depends(get_session)) -> list[Project]:
    return db.query(Project).order_by(Project.created_at.desc()).all()


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_session)) -> Project:
    project = Project(
        name=payload.name,
        engine=payload.engine,
        platform=payload.platform,
        config=payload.config.model_dump(exclude_none=True),
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def _get_or_404(db: Session, project_id: UUID) -> Project:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "project not found"}})
    return project


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: UUID, db: Session = Depends(get_session)) -> Project:
    return _get_or_404(db, project_id)


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: UUID,
    payload: ProjectUpdate,
    db: Session = Depends(get_session),
) -> Project:
    project = _get_or_404(db, project_id)
    updates = payload.model_dump(exclude_unset=True)
    if "config" in updates and updates["config"] is not None:
        updates["config"] = payload.config.model_dump(exclude_none=True) if payload.config else {}
    for key, value in updates.items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: UUID, db: Session = Depends(get_session)) -> None:
    project = _get_or_404(db, project_id)
    db.delete(project)
    db.commit()


@router.get("/{project_id}/export", response_model=ProjectRead)
def export_project(project_id: UUID, db: Session = Depends(get_session)) -> Project:
    """Alias explícito de GET /{id}, presente para claridad: el JSON devuelto es el formato canónico."""
    return _get_or_404(db, project_id)


@router.post("/import", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def import_project(payload: ProjectCreate, db: Session = Depends(get_session)) -> Project:
    """Mismo cuerpo que POST /projects; queda como endpoint separado por documentación."""
    return create_project(payload, db)  # type: ignore[return-value]
