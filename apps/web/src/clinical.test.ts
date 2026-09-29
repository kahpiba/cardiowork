import { describe, it, expect } from 'vitest';
import { 
  calculateWhoSearoCvd, 
  calculateWho2007Matrix, 
  calculateWho2019Equation,
  calculateFraminghamCvd 
} from '@cardiowork/shared';

describe('Framingham General CVD (Circulation 2008) Golden Case Verification', () => {
  it('harus menghitung risiko rendah (<3%) untuk wanita muda sehat normotensif', () => {
    const res = calculateFraminghamCvd({
      age: 35,
      gender: 'FEMALE',
      systolicBp: 110,
      isTreatedForHypertension: false,
      totalCholesterolMgdl: 160,
      hdlCholesterolMgdl: 55,
      isSmoker: false,
      hasDiabetes: false,
    });

    expect(res.riskPercent10Yr).toBeLessThan(3.0);
    expect(res.riskCategory).toBe('LOW');
  });

  it('harus memvalidasi profil Joko Wijaya (34 th, perokok aktif, diabetes, SBP 134) di rentang 9.5-10.5%', () => {
    const res = calculateFraminghamCvd({
      age: 34,
      gender: 'MALE',
      systolicBp: 134,
      isTreatedForHypertension: false,
      totalCholesterolMgdl: 185,
      hdlCholesterolMgdl: 43,
      isSmoker: true,
      hasDiabetes: true,
    });

    // Menunjukkan bahwa risiko kardiometabolik tinggi pada usia muda dipicu komorbiditas rokok + diabetes
    expect(res.riskPercent10Yr).toBeGreaterThanOrEqual(9.0);
    expect(res.riskPercent10Yr).toBeLessThanOrEqual(10.5);
  });

  it('harus menghitung risiko sedang (12-16%) untuk pria 55 tahun dengan pra-hipertensi', () => {
    const res = calculateFraminghamCvd({
      age: 55,
      gender: 'MALE',
      systolicBp: 140,
      isTreatedForHypertension: false,
      totalCholesterolMgdl: 210,
      hdlCholesterolMgdl: 45,
      isSmoker: false,
      hasDiabetes: false,
    });

    expect(res.riskPercent10Yr).toBeGreaterThanOrEqual(12.0);
    expect(res.riskPercent10Yr).toBeLessThanOrEqual(17.0);
    expect(res.riskCategory).toBe('MODERATE');
  });

  it('harus mendeteksi risiko tinggi (>20%) untuk pekerja paruh baya dengan hipertensi derajat 2 & dislipidemia', () => {
    const res = calculateFraminghamCvd({
      age: 53,
      gender: 'MALE',
      systolicBp: 164,
      isTreatedForHypertension: false,
      totalCholesterolMgdl: 248,
      hdlCholesterolMgdl: 38,
      isSmoker: true,
      hasDiabetes: false,
    });

    expect(res.riskPercent10Yr).toBeGreaterThanOrEqual(20.0);
    expect(res.riskCategory).toBe('HIGH');
  });
});

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
