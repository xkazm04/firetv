package dev.deathride.core

/** Simulation angles are small. Reduce to a small polynomial kernel interval.
 * Java 22 FdLibm otherwise allocates a double[2] for every sin/cos outside +/- pi/4.
 * Use fixed polynomial kernels and deterministic reduction on JVM and Android.
 */
object StrictTrig {
    // Taylor polynomials on [-pi/4, pi/4], error below 2e-15 including reduction.
    // Coefficients are reciprocal factorials, mathematical constants, not tuning.
    private fun sinKernel(x: Double): Double {
        val z=x*x
        return x*(1+z*(-1.0/6+z*(1.0/120+z*(-1.0/5040+z*(1.0/362880+z*(-1.0/39916800+z*(1.0/6227020800+z*(-1.0/1307674368000+z/355687428096000))))))))
    }
    private fun cosKernel(x: Double): Double {
        val z=x*x
        return 1+z*(-1.0/2+z*(1.0/24+z*(-1.0/720+z*(1.0/40320+z*(-1.0/3628800+z*(1.0/479001600+z*(-1.0/87178291200+z/20922789888000)))))))
    }
    fun sin(angle: Double): Double {
        val q=java.lang.StrictMath.floor(angle/(Math.PI/2)+.5).toInt()
        val r=angle-q*(Math.PI/2)
        return when(q and 3) { 0 -> sinKernel(r); 1 -> cosKernel(r); 2 -> -sinKernel(r); else -> -cosKernel(r) }
    }
    fun cos(angle: Double): Double {
        val q=java.lang.StrictMath.floor(angle/(Math.PI/2)+.5).toInt()
        val r=angle-q*(Math.PI/2)
        return when(q and 3) { 0 -> cosKernel(r); 1 -> -sinKernel(r); 2 -> -cosKernel(r); else -> sinKernel(r) }
    }
}
