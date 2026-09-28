import { describe, it, expect } from 'vitest';
import { calculateWhoSearoCvd, calculateWho2007Matrix, calculateWho2019Equation } from '@cardiowork/shared';

describe('WHO/ISH SEARO Dual-Engine Clinical Verification', () => {
  it('harus mengklasifikasikan pekerja muda normotensif non-smoker ke <10%', () => {
    const res = calculateWhoSearoCvd({
      age: 32,
      gender: 'MALE',
      systolicBp: 118,
      isSmoker: false,
      hasDiabetes: false,
      totalCholesterolMgdl: 175
    });

    expect(res.riskTier).toBe('<10%');
    expect(res.who2007MatrixTier).toBe('<10%');
    expect(res.who2019EquationPercent).toBeLessThan(10);
  });

  it('harus mendeteksi risiko tinggi/kritis pada pekerja perokok tua dengan diabetes & hipertensi stadium 2', () => {
    const res = calculateWhoSearoCvd({
      age: 65,
      gender: 'MALE',
      systolicBp: 175,
      isSmoker: true,
      hasDiabetes: true,
      totalCholesterolMgdl: 260
    });

    expect(['20%-<30%', '30%-<40%', '>=40%']).toContain(res.riskTier);
    expect(res.who2019EquationPercent).toBeGreaterThan(20);
  });
});
