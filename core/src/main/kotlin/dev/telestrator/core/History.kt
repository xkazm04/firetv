package dev.telestrator.core

/**
 * Undo/redo as an operation log rather than a stack of snapshots.
 *
 * The snapshot approach is tempting and wrong here: a telestration session can hold a few hundred
 * annotations, and copying the whole list on every stroke is the same per-message allocation
 * problem that cost us the pen latency budget. An operation is a handful of bytes and inverts
 * exactly — undoing an erase puts the annotation back at the index it came from, not on the end.
 */
sealed interface Op {
    data class Add(val annotation: Annotation) : Op
    data class Remove(val index: Int, val annotation: Annotation) : Op
    data class ClearAll(val previous: List<Annotation>) : Op

    /**
     * Several annotations taken out at once (Clear on one frame). [removed] holds each one with the
     * index it had, ascending, so the undo puts every one back where it was, not on the end.
     */
    data class RemoveSet(val removed: List<IndexedValue<Annotation>>) : Op
}

class History {

    private val undoStack = ArrayDeque<Op>()
    private val redoStack = ArrayDeque<Op>()

    val canUndo: Boolean get() = undoStack.isNotEmpty()
    val canRedo: Boolean get() = redoStack.isNotEmpty()

    /** The operation the next [undo] would invert, without inverting it. */
    fun peekUndo(): Op? = undoStack.lastOrNull()

    /** The operation the next [redo] would re-apply, without applying it. */
    fun peekRedo(): Op? = redoStack.lastOrNull()

    /** Records an operation that has just been applied. Any redo branch is abandoned. */
    fun record(op: Op) {
        undoStack.addLast(op)
        redoStack.clear()
        // A session that runs all evening should not grow without bound.
        if (undoStack.size > MAX_DEPTH) undoStack.removeFirst()
    }

    /** Applies the inverse of the last operation to [target]. Returns false if there was none. */
    fun undo(target: MutableList<Annotation>): Boolean {
        val op = undoStack.removeLastOrNull() ?: return false
        invert(op, target)
        redoStack.addLast(op)
        return true
    }

    /** Re-applies the last undone operation. Returns false if there was none. */
    fun redo(target: MutableList<Annotation>): Boolean {
        val op = redoStack.removeLastOrNull() ?: return false
        apply(op, target)
        undoStack.addLast(op)
        return true
    }

    fun clear() {
        undoStack.clear()
        redoStack.clear()
    }

    private fun apply(op: Op, target: MutableList<Annotation>) {
        when (op) {
            is Op.Add -> target += op.annotation
            is Op.Remove -> if (op.index in target.indices) target.removeAt(op.index)
            is Op.ClearAll -> target.clear()
            is Op.RemoveSet -> {
                val ids = op.removed.mapTo(HashSet()) { it.value.id }
                target.removeAll { it.id in ids }
            }
        }
    }

    private fun invert(op: Op, target: MutableList<Annotation>) {
        when (op) {
            is Op.Add -> if (target.isNotEmpty()) target.removeAt(target.lastIndex)
            is Op.Remove -> target.add(op.index.coerceIn(0, target.size), op.annotation)
            is Op.ClearAll -> {
                target.clear()
                target.addAll(op.previous)
            }
            // Ascending, so each index is counted in the list as it was when the set came out.
            is Op.RemoveSet -> for ((index, a) in op.removed) target.add(index.coerceIn(0, target.size), a)
        }
    }

    private companion object {
        const val MAX_DEPTH = 200
    }
}
