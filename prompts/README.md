# Registro de conversaciones con la IA

Este directorio almacena las conversaciones significativas con el asistente
de IA que ha generado el código del proyecto. Sirven como evidencia para el
criterio 2 de la rúbrica (25%: "Capacidad de formular instrucciones eficaces
al asistente de IA") y como material para el criterio 4 (20%: documentación
del proceso y análisis crítico).

## Convención de nombrado

`NNN-<tema>.md`, con `NNN` numérico incremental de tres dígitos.

Ejemplos:

- `000-definicion-inicial.md`
- `001-scaffold-repo.md`
- `002-calc-core-textura.md`

## Qué guardar

- Prompts que llevan a decisiones de arquitectura o diseño.
- Iteraciones donde la IA se equivoca y la corrección.
- Refactorizaciones de alcance.
- Depuración de errores no triviales.

Los CRUDs rutinarios y los cambios triviales no necesitan quedar aquí; se
resumen en la nota de sesión correspondiente.

## Formato sugerido

Cada archivo empieza con un encabezado:

```markdown
# NNN — Título breve

**Fecha:** DD/MM/AAAA
**Asistente:** claude-opus-4-7 (Cowork)
**Contexto:** una o dos frases situando la conversación
**Resultado:** qué se produjo (fichero, decisión, etc.)
```

Y a continuación:

- **Prompt(s) clave** literales.
- **Respuesta o acción** de la IA (resumen; no hace falta pegar todo).
- **Análisis crítico:** qué salió bien, qué falló, qué se corrigió y por qué.
