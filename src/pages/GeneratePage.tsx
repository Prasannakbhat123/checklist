import { useState } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';

interface CSVRow {
  section: string;
  label: string;
  item: string;
  points: string;
  guidance: string;
}

// Hardcoded reference data from the two test CSV files (Asthma and Seizure)
// This maps based on matching labels to provide appropriate test data
const REFERENCE_DATA: { [key: string]: CSVRow } = {
  // Common items from both CSVs
  'Subjective_Chief Complaint': {
    section: 'Subjective',
    label: 'Chief Complaint',
    item: '"Shortness of Breath" OR "lost consciousness"',
    points: '1',
    guidance: 'Novice learners may be asked to gather and document the chief complaint in their note. This should be case specific so that they document the correct chief complaint.',
  },
  'Subjective_Name - Any Male or Female Name': {
    section: 'Subjective',
    label: 'Name - Any Male or Female Name',
    item: 'any name',
    points: '1',
    guidance: 'Any name will be given credit.',
  },
  'Subjective_Patient Age or Date of Birth': {
    section: 'Subjective',
    label: 'Patient Age or Date of Birth',
    item: 'age or date of birth',
    points: '1',
    guidance: 'Novice learners or learning settings with age not provided (initial triage nurse), the learners may be asked to gather and document the age or date of birth in their note.',
  },
  'Subjective_Patient Sex Male or Female': {
    section: 'Subjective',
    label: 'Patient Sex Male or Female',
    item: 'male or female',
    points: '1',
    guidance: 'The word male or female will get credit if this item is graded.',
  },
  'Subjective_Patient Gender Identification': {
    section: 'Subjective',
    label: 'Patient Gender Identification',
    item: '',
    points: '',
    guidance: 'If learners are to gather gender identification, this could be graded. Case specific grading requires the gender identification to be noted in the item.',
  },
  'Subjective_HPI subitem onset timing': {
    section: 'Subjective',
    label: 'HPI subitem onset timing',
    item: 'started last night OR A FEW MONTHS AGO',
    points: '1',
    guidance: 'When were symptoms first noticed?',
  },
  'Subjective_HPI subitem onset speed': {
    section: 'Subjective',
    label: 'HPI subitem onset speed',
    item: '',
    points: '',
    guidance: 'Did the symptoms begin rapidly or slowly?',
  },
  'Subjective_HPI subitem duration': {
    section: 'Subjective',
    label: 'HPI subitem duration',
    item: 'lasted about one minute OR A FEW MONTHS',
    points: '1',
    guidance: 'How long have you had the symptoms? How long do episodes last?',
  },
  'Subjective_HPI subitem timing': {
    section: 'Subjective',
    label: 'HPI subitem timing',
    item: 'AT WORK',
    points: '1',
    guidance: 'Is there a pattern of the timing of the pain (day/night, situational timing)?',
  },
  'Subjective_HPI subitem location': {
    section: 'Subjective',
    label: 'HPI subitem location',
    item: 'IN THE CHEST',
    points: '1',
    guidance: 'Where on the body is your pain or describe where you are feeling the symptom?',
  },
  'Subjective_HPI subitem location radiation': {
    section: 'Subjective',
    label: 'HPI subitem location radiation',
    item: 'NO RADIATION',
    points: '1',
    guidance: 'Does the pain move anywhere else or radiate from one spot to another?',
  },
  'Subjective_HPI subitem character': {
    section: 'Subjective',
    label: 'HPI subitem character',
    item: 'shaking all over OR TIGHTNESS IN THE CHEST',
    points: '1',
    guidance: 'Describe the nature of the pain or symptom (e.g., sharp, burning, throbbing, dull, aching, pressure, stabbing, tingling)',
  },
  'Subjective_HPI subitem severity': {
    section: 'Subjective',
    label: 'HPI subitem severity',
    item: '',
    points: '',
    guidance: 'How severe is your pain? How does this compare to past episodes?',
  },
  'Subjective_HPI subitem severity scale required': {
    section: 'Subjective',
    label: 'HPI subitem severity scale required',
    item: 'it was an 8 on a scale of 1 to 10 OR 7 out of 10',
    points: '1',
    guidance: 'How severe is the pain on a scale of 0-10?',
  },
  'Subjective_HPI subitem aggravating factors': {
    section: 'Subjective',
    label: 'HPI subitem aggravating factors',
    item: 'recent cessation of alcohol OR WORKING',
    points: '1',
    guidance: 'Are there activities (eating, exercise, standing, etc.) that make the symptom worse? Have you noticed things that trigger the symptoms?',
  },
  'Subjective_HPI subitem relieving factors': {
    section: 'Subjective',
    label: 'HPI subitem relieving factors',
    item: 'RESCUE (ALBUTEROL) INHALER',
    points: '1',
    guidance: 'Have you found something that relieves the symptoms (medication, position, eating, etc.)?',
  },
  'Subjective_HPI subitem relevant exposures': {
    section: 'Subjective',
    label: 'HPI subitem relevant exposures',
    item: 'SAW DUST',
    points: '1',
    guidance: 'Any relevant infectious or occupational exposures? (e.g., covid illness in sibling, asbestos exposure)',
  },
  'Subjective_OutcomeAdditional Circumstances/Signs or Symptoms/Affecting life': {
    section: 'Subjective',
    label: 'OutcomeAdditional Circumstances/Signs or Symptoms/Affecting life',
    item: 'FEAR OF LOSING JOB',
    points: '1',
    guidance: 'Consider the learning objectives and relevance of such topics.',
  },
  'Subjective_PMH: Similar episodes': {
    section: 'Subjective',
    label: 'PMH: Similar episodes',
    item: 'No prior seizures OR AS A CHILD',
    points: '1',
    guidance: 'Items like past episodes of the symptom, visits for this, past treatment response',
  },
  'Subjective_PMH: Active Problem List': {
    section: 'Subjective',
    label: 'PMH: Active Problem List',
    item: 'hypertension OR NONE',
    points: '1',
    guidance: 'Active diagnoses with or without treatment',
  },
  'Subjective_PMH: Hospitalizations and Past Illness': {
    section: 'Subjective',
    label: 'PMH: Hospitalizations and Past Illness',
    item: 'NONE',
    points: '1',
    guidance: 'Hospitalizations and old or remote illnesses',
  },
  'Subjective_PMH: Medications: Medication name': {
    section: 'Subjective',
    label: 'PMH: Medications: Medication name',
    item: 'HCTZ OR ALBUTEROL INHALER',
    points: '1',
    guidance: 'Medication names (if faculty note the generic and trade names credit will be given for either, likewise credit will be given for acceptable abbreviations listed)',
  },
  'Subjective_PMH: Medications: Dosing': {
    section: 'Subjective',
    label: 'PMH: Medications: Dosing',
    item: '2 PUFFS AS NEEDED',
    points: '1',
    guidance: 'Medication route, frequency',
  },
  'Subjective_PMH: Medications: Adherence (previously called "compliance")': {
    section: 'Subjective',
    label: 'PMH: Medications: Adherence (previously called "compliance")',
    item: 'adherent or taking the medication OR COMPLIANT',
    points: '1',
    guidance: 'Documentation of medication adherence',
  },
  'Subjective_PMH: Allergies medications': {
    section: 'Subjective',
    label: 'PMH: Allergies medications',
    item: 'none or NKDA',
    points: '1',
    guidance: 'If allergy item gives both trade and generic then either noted by the learner would count. If the item notes what the reactions is, then that would be needed for credit.',
  },
  'Subjective_PMH: Allergies food or environmental': {
    section: 'Subjective',
    label: 'PMH: Allergies food or environmental',
    item: 'NONE',
    points: '1',
    guidance: 'If the reaction type is not noted, it will not be graded.',
  },
  'Subjective_PMH: Recovery or Abstinence from any substances or alcohol': {
    section: 'Subjective',
    label: 'PMH: Recovery or Abstinence from any substances or alcohol',
    item: 'heavy alcohol use (two 750 mL bottles of spirits per week), recently quit drinking 1 week ago',
    points: '1',
    guidance: 'For capture of prior addiction treatment, recovery status',
  },
  'Subjective_PSH: Past Surgeries': {
    section: 'Subjective',
    label: 'PSH: Past Surgeries',
    item: 'no surgeries OR NONE',
    points: '1',
    guidance: 'Specific and separate headings for past surgical history, abbreviations count, option to make each surgery noted an item, or simply capture a list.',
  },
  'Subjective_PSH: Complications': {
    section: 'Subjective',
    label: 'PSH: Complications',
    item: '',
    points: '',
    guidance: 'Only use if relevant to case learning objectives.',
  },
  'Subjective_FH: HPI Relevant ': {
    section: 'Subjective',
    label: 'FH: HPI Relevant ',
    item: 'mom died of brain cancer, dad died of effects of alcoholism OR ADOPTED',
    points: '1',
    guidance: 'Items that are relevant to an active CC-HPI combination. e.g., FH of heart disease in a chest pain patient',
  },
  'Subjective_FH: Preventive Relevant': {
    section: 'Subjective',
    label: 'FH: Preventive Relevant',
    item: 'colonoscopy 10 years ago was normal',
    points: '1',
    guidance: 'Items that are relevant to any wellness or preventive visit. This would include genetic diseases, risks for cancer, prior occupational exposures, etc.',
  },
  'Subjective_SH: relationships and/or marital status': {
    section: 'Subjective',
    label: 'SH: relationships and/or marital status',
    item: 'divorced OR SINGLE',
    points: '1',
    guidance: '',
  },
  'Subjective_SH: children': {
    section: 'Subjective',
    label: 'SH: children',
    item: '',
    points: '',
    guidance: '',
  },
  'Subjective_SH: occupation': {
    section: 'Subjective',
    label: 'SH: occupation',
    item: 'ENGINEER',
    points: '1',
    guidance: '',
  },
  'Subjective_SH: military service': {
    section: 'Subjective',
    label: 'SH: military service',
    item: '',
    points: '',
    guidance: '',
  },
  'Subjective_SH: alcohol use': {
    section: 'Subjective',
    label: 'SH: alcohol use',
    item: 'heavy alcohol use for 40 years suddenly stopped OR NONE',
    points: '1',
    guidance: 'Use if current alcohol use is relevant to the case.',
  },
  'Subjective_SH: tobacco product use': {
    section: 'Subjective',
    label: 'SH: tobacco product use',
    item: 'NONE',
    points: '1',
    guidance: '',
  },
  'Subjective_SH: vaping use': {
    section: 'Subjective',
    label: 'SH: vaping use',
    item: 'NONE',
    points: '1',
    guidance: '',
  },
  'Subjective_SH: non-prescribed drug use': {
    section: 'Subjective',
    label: 'SH: non-prescribed drug use',
    item: 'MARIJUANA',
    points: '1',
    guidance: '',
  },
  'Subjective_SH: housing security': {
    section: 'Subjective',
    label: 'SH: housing security',
    item: '',
    points: '',
    guidance: 'Use if housing security discussion is relevant to the case',
  },
  'Subjective_SH: food security': {
    section: 'Subjective',
    label: 'SH: food security',
    item: '',
    points: '',
    guidance: 'Use of food security discussion is relevant to the case',
  },
  'Subjective_SH: physical security': {
    section: 'Subjective',
    label: 'SH: physical security',
    item: '',
    points: '',
    guidance: 'Use if physical security (risk of interpersonal violence) is relevant to the case',
  },
  'Subjective_SH: financial security': {
    section: 'Subjective',
    label: 'SH: financial security',
    item: '',
    points: '',
    guidance: 'Use if financial security is relevant to the case e.g. ability to afford medications',
  },
  'Subjective_Preventive: Immunizations/Seasonal Screening': {
    section: 'Subjective',
    label: 'Preventive: Immunizations/Seasonal Screening',
    item: 'Immunizations UTD OR UP TO DATE',
    points: '1',
    guidance: 'Use for things like past vaccinations, screening for infectious risk',
  },
  'Subjective_Preventive: Colon cancer screening': {
    section: 'Subjective',
    label: 'Preventive: Colon cancer screening',
    item: 'colon cancer screen 10 years ago',
    points: '1',
    guidance: 'Use for things like past cologard, colonoscopy, other',
  },
  'Subjective_Preventive: Prostate cancer screening': {
    section: 'Subjective',
    label: 'Preventive: Prostate cancer screening',
    item: '',
    points: '',
    guidance: 'Use for things like past PSA levels or physical examinations',
  },
  'Subjective_Preventive: Testicle cancer screening': {
    section: 'Subjective',
    label: 'Preventive: Testicle cancer screening',
    item: '',
    points: '',
    guidance: 'Use for self exam history or professional exams',
  },
  'Subjective_Preventive: Breast cancer screening': {
    section: 'Subjective',
    label: 'Preventive: Breast cancer screening',
    item: '',
    points: '',
    guidance: 'Use for things like mammograms, follow up studies after mammograms',
  },
  'Subjective_Preventive: Cervical cancer screening': {
    section: 'Subjective',
    label: 'Preventive: Cervical cancer screening',
    item: '',
    points: '',
    guidance: 'Use for PAP history of having and results',
  },
  'Subjective_Preventive: STI risks': {
    section: 'Subjective',
    label: 'Preventive: STI risks',
    item: '',
    points: '',
    guidance: 'Use for things like condom use, partner history, exposure history, HIV PREP',
  },
  'Subjective_Preventive: Exercise past/current': {
    section: 'Subjective',
    label: 'Preventive: Exercise past/current',
    item: 'OCCASIONAL EXERCISE',
    points: '1',
    guidance: 'Use if referring to past or current exercise patterns. Planning goes in treatment plan.',
  },
  'Subjective_Preventive: Diet': {
    section: 'Subjective',
    label: 'Preventive: Diet',
    item: 'WELL BALANCED',
    points: '1',
    guidance: 'Use in regards to diet content rather than food security covered in social history. e.g., caffeine, processed foods, calorie intake',
  },
  'Subjective_ROS: General Health': {
    section: 'Subjective',
    label: 'ROS: General Health',
    item: 'trouble sleeping OR NO FEVERS OR CHILLS OR WEIGHT CHANGES',
    points: '1',
    guidance: '',
  },
  'Subjective_ROS: Vision-Eye': {
    section: 'Subjective',
    label: 'ROS: Vision-Eye',
    item: '',
    points: '',
    guidance: '',
  },
  'Subjective_ROS: Head and Neck (includes Ear, Nose, Throat)': {
    section: 'Subjective',
    label: 'ROS: Head and Neck (includes Ear, Nose, Throat)',
    item: '',
    points: '',
    guidance: '',
  },
  'Subjective_ROS: Pulmonary': {
    section: 'Subjective',
    label: 'ROS: Pulmonary',
    item: 'SHORTNESS OF BREATH',
    points: '1',
    guidance: '',
  },
  'Subjective_ROS: Cardiovascular': {
    section: 'Subjective',
    label: 'ROS: Cardiovascular',
    item: 'NO CHEST PAIN OR PALPITATIONS',
    points: '1',
    guidance: '',
  },
  'Subjective_ROS: Gastrointestinal': {
    section: 'Subjective',
    label: 'ROS: Gastrointestinal',
    item: 'NO NAUSEA OR VOMITING OR DIARRHEA',
    points: '1',
    guidance: '',
  },
  'Subjective_ROS: Genito-urinary': {
    section: 'Subjective',
    label: 'ROS: Genito-urinary',
    item: '',
    points: '',
    guidance: '',
  },
  'Subjective_ROS: Hematology/Oncology': {
    section: 'Subjective',
    label: 'ROS: Hematology/Oncology',
    item: '',
    points: '',
    guidance: '',
  },
  'Subjective_ROS: OB/GYN/BREAST': {
    section: 'Subjective',
    label: 'ROS: OB/GYN/BREAST',
    item: '',
    points: '',
    guidance: '',
  },
  'Subjective_ROS: Neurological': {
    section: 'Subjective',
    label: 'ROS: Neurological',
    item: '',
    points: '',
    guidance: '',
  },
  'Subjective_ROS: Endocrine': {
    section: 'Subjective',
    label: 'ROS: Endocrine',
    item: '',
    points: '',
    guidance: '',
  },
  'Subjective_ROS: Infectious Disease': {
    section: 'Subjective',
    label: 'ROS: Infectious Disease',
    item: '',
    points: '',
    guidance: '',
  },
  'Subjective_ROS: Musculoskeletal': {
    section: 'Subjective',
    label: 'ROS: Musculoskeletal',
    item: '',
    points: '',
    guidance: '',
  },
  'Subjective_ROS: Mental Health': {
    section: 'Subjective',
    label: 'ROS: Mental Health',
    item: '',
    points: '',
    guidance: '',
  },
  'Subjective_ROS: Skin and Hair': {
    section: 'Subjective',
    label: 'ROS: Skin and Hair',
    item: '',
    points: '',
    guidance: '',
  },
  'Objective_PE: Vital Signs: Temperature (Temp, T)': {
    section: 'Objective',
    label: 'PE: Vital Signs: Temperature (Temp, T)',
    item: 'Temperature (Temp, T) OR TEMP 98.6',
    points: '1',
    guidance: 'Enter the specific temperature and units of F or C',
  },
  'Objective_PE: Vital Signs: Heart Rate (HR)': {
    section: 'Objective',
    label: 'PE: Vital Signs: Heart Rate (HR)',
    item: 'Heart Rate (HR) OR HR 100',
    points: '1',
    guidance: 'Enter the specific HR',
  },
  'Objective_PE: Vital Signs: Respiratory Rate (RR)': {
    section: 'Objective',
    label: 'PE: Vital Signs: Respiratory Rate (RR)',
    item: 'Respiratory Rate (RR) OR RR 22',
    points: '1',
    guidance: 'Enter the specific RR',
  },
  'Objective_PE: Vital Signs: Blood Pressure (BP)': {
    section: 'Objective',
    label: 'PE: Vital Signs: Blood Pressure (BP)',
    item: 'Blood Pressure (BP) OR BP 120/70',
    points: '1',
    guidance: 'Enter the specific BP in format systolic number/diastolic number',
  },
  'Objective_PE: Vital Signs: Pulse Oximetry (POx)': {
    section: 'Objective',
    label: 'PE: Vital Signs: Pulse Oximetry (POx)',
    item: 'Pulse Ox (Pox) OR OXYGEN SATURATION 91%',
    points: '1',
    guidance: 'Enter the specific Pox % value',
  },
  'Objective_PE: Vital Signs: Height (Hgt)': {
    section: 'Objective',
    label: 'PE: Vital Signs: Height (Hgt)',
    item: 'Height (hgt, ht) OR HT 5\'6"',
    points: '1',
    guidance: 'Enter the height in the same units that will be used on site. (english or metric)',
  },
  'Objective_PE: Vital Signs: Weight (Wgt)': {
    section: 'Objective',
    label: 'PE: Vital Signs: Weight (Wgt)',
    item: 'Weight (wgt, wt) OR WT 189 POUNDS',
    points: '1',
    guidance: 'Enter the weight in the same units that will be used on site. (english or metric)',
  },
  'Objective_PE: General': {
    section: 'Objective',
    label: 'PE: General',
    item: 'WDWN, slightly anxious OR UNCOMFORTABLE, OUT OF BREATH, SEATED',
    points: '1',
    guidance: 'Item should ask for specific terms such as "cachectic, high BMI, mobile or immobile, etc."',
  },
  'Objective_PE: Neurological': {
    section: 'Objective',
    label: 'PE: Neurological',
    item: 'abnormal finger-nose-finger test',
    points: '1',
    guidance: '',
  },
  'Objective_PE: Head': {
    section: 'Objective',
    label: 'PE: Head',
    item: 'NCAT',
    points: '1',
    guidance: '',
  },
  'Objective_PE: Eyes': {
    section: 'Objective',
    label: 'PE: Eyes',
    item: 'PERRLA, EOMI',
    points: '1',
    guidance: '',
  },
  'Objective_PE: Ears': {
    section: 'Objective',
    label: 'PE: Ears',
    item: '',
    points: '',
    guidance: '',
  },
  'Objective_PE: Nose': {
    section: 'Objective',
    label: 'PE: Nose',
    item: 'NARES PATENT, SEPTUM MIDLINE',
    points: '1',
    guidance: '',
  },
  'Objective_PE: Mouth/Throat': {
    section: 'Objective',
    label: 'PE: Mouth/Throat',
    item: 'NO EXUDATES OR ERYTHEMA, UVULA MIDLINE',
    points: '1',
    guidance: '',
  },
  'Objective_PE: Neck ': {
    section: 'Objective',
    label: 'PE: Neck ',
    item: 'NO LYMPHADENOPATHY, TRACHEA MIDLINE',
    points: '1',
    guidance: '',
  },
  'Objective_PE: Lungs': {
    section: 'Objective',
    label: 'PE: Lungs',
    item: 'BILATERAL EXPIRATORY WHEEZING',
    points: '1',
    guidance: '',
  },
  'Objective_PE: Heart': {
    section: 'Objective',
    label: 'PE: Heart',
    item: 'RRR, NO MURMURS',
    points: '1',
    guidance: '',
  },
  'Objective_PE: Abdomen': {
    section: 'Objective',
    label: 'PE: Abdomen',
    item: 'SOFT, NONTENDER, NONDISTENDED, +BS IN ALL FOUR QUADRANTS',
    points: '1',
    guidance: '',
  },
  'Objective_PE: Pelvic': {
    section: 'Objective',
    label: 'PE: Pelvic',
    item: '',
    points: '',
    guidance: '',
  },
  'Objective_PE: Vascular': {
    section: 'Objective',
    label: 'PE: Vascular',
    item: '',
    points: '',
    guidance: '',
  },
  'Objective_PE: Extremities': {
    section: 'Objective',
    label: 'PE: Extremities',
    item: '',
    points: '',
    guidance: '',
  },
  'Objective_PE: Musculoskeletal': {
    section: 'Objective',
    label: 'PE: Musculoskeletal',
    item: '',
    points: '',
    guidance: '',
  },
  'Objective_PE: Osteopathic': {
    section: 'Objective',
    label: 'PE: Osteopathic',
    item: 'Tissue texture abnormality and tenderness mid thoracic spine OR UPPER THORACIC TENDERNESS',
    points: '1',
    guidance: 'details on spine level, muscle character, tissue abnormality, symmetry or asymmetry, restriction of motion, tenderness (TAART findings)',
  },
  'Assessment_DDx 1': {
    section: 'Assessment',
    label: 'DDx 1',
    item: 'generalized tonic-clonic seizure OR ASTHMA EXACERBATION',
    points: '1',
    guidance: 'Most likely or actual diagnosis should be listed first, with ideally descending order of likelihood.',
  },
  'Assessment_DDx 1Justification Item': {
    section: 'Assessment',
    label: 'DDx 1Justification Item',
    item: '',
    points: '',
    guidance: 'DDx justification items may or may not be used. Example: for PE history of long plane trip might be used to justify putting PE on the DDx. Leave justification sections blank if not using.',
  },
  'Assessment_DDx 2': {
    section: 'Assessment',
    label: 'DDx 2',
    item: 'Alcohol withdrawal OR SOMATIC DYSFUNCTION',
    points: '1',
    guidance: '',
  },
  'Assessment_DDx 2 Justification Item': {
    section: 'Assessment',
    label: 'DDx 2 Justification Item',
    item: '',
    points: '',
    guidance: '',
  },
  'Assessment_DDx 3': {
    section: 'Assessment',
    label: 'DDx 3',
    item: 'Thoracic somatic dysfunction OR MARIJUANA USE',
    points: '1',
    guidance: '',
  },
  'Assessment_DDx 3 Justification Item': {
    section: 'Assessment',
    label: 'DDx 3 Justification Item',
    item: '',
    points: '',
    guidance: '',
  },
  'Assessment_DDx 4': {
    section: 'Assessment',
    label: 'DDx 4',
    item: 'Dysmetria',
    points: '1',
    guidance: '',
  },
  'Assessment_DDx 4 Justification Item': {
    section: 'Assessment',
    label: 'DDx 4 Justification Item',
    item: '',
    points: '',
    guidance: '',
  },
  'Assessment_DDx 5 ': {
    section: 'Assessment',
    label: 'DDx 5 ',
    item: '',
    points: '',
    guidance: '',
  },
  'Assessment_DDx 5 Justification Item': {
    section: 'Assessment',
    label: 'DDx 5 Justification Item',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_WU Item 1': {
    section: 'Plan',
    label: 'WU Item 1',
    item: 'CT head OR CHEST XRAY',
    points: '1',
    guidance: '',
  },
  'Plan_WU Item 2': {
    section: 'Plan',
    label: 'WU Item 2',
    item: 'EEG OR PEAK FLOW',
    points: '1',
    guidance: '',
  },
  'Plan_WU Item 3': {
    section: 'Plan',
    label: 'WU Item 3',
    item: 'Sodium and other electrolytes, or BMP or CMP OR SPIROMETRY',
    points: '1',
    guidance: '',
  },
  'Plan_WU Item 4': {
    section: 'Plan',
    label: 'WU Item 4',
    item: 'consider liver enzymes due to alcohol abuse OR CBC OR CMP OR BLOOD GASSES',
    points: '1',
    guidance: '',
  },
  'Plan_WU Item 5': {
    section: 'Plan',
    label: 'WU Item 5',
    item: 'consider referral to neurology',
    points: '1',
    guidance: '',
  },
  'Plan_WU Item 6': {
    section: 'Plan',
    label: 'WU Item 6',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_WU Item 7': {
    section: 'Plan',
    label: 'WU Item 7',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_WU Item 8': {
    section: 'Plan',
    label: 'WU Item 8',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_WU Item 9': {
    section: 'Plan',
    label: 'WU Item 9',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_WU Item 10': {
    section: 'Plan',
    label: 'WU Item 10',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_WU Item 11': {
    section: 'Plan',
    label: 'WU Item 11',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_WU Item 12': {
    section: 'Plan',
    label: 'WU Item 12',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_WU Item 13': {
    section: 'Plan',
    label: 'WU Item 13',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_WU Item 14': {
    section: 'Plan',
    label: 'WU Item 14',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_WU Item 15': {
    section: 'Plan',
    label: 'WU Item 15',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_WU Item 16': {
    section: 'Plan',
    label: 'WU Item 16',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Tx Item 1': {
    section: 'Plan',
    label: 'Tx Item 1',
    item: 'consider benzodiazepine or gabapentin or carbamezepine OR ALBUTEROL NEBULIZER',
    points: '1',
    guidance: '',
  },
  'Plan_Tx Item 2': {
    section: 'Plan',
    label: 'Tx Item 2',
    item: 'Alcohol rehabilitation OR CORTICOSTEROIDS',
    points: '1',
    guidance: '',
  },
  'Plan_Tx Item 3': {
    section: 'Plan',
    label: 'Tx Item 3',
    item: 'consider anticonvulsant OR OMT AS ABLE',
    points: '1',
    guidance: '',
  },
  'Plan_Tx Item 4': {
    section: 'Plan',
    label: 'Tx Item 4',
    item: 'OUTPATIENT OR INPATIENT',
    points: '1',
    guidance: '',
  },
  'Plan_Tx Item 5': {
    section: 'Plan',
    label: 'Tx Item 5',
    item: 'OXYGEN',
    points: '1',
    guidance: '',
  },
  'Plan_Tx Item 6': {
    section: 'Plan',
    label: 'Tx Item 6',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Tx Item 7': {
    section: 'Plan',
    label: 'Tx Item 7',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Tx Item 8': {
    section: 'Plan',
    label: 'Tx Item 8',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Tx Item 9': {
    section: 'Plan',
    label: 'Tx Item 9',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Tx Item 10': {
    section: 'Plan',
    label: 'Tx Item 10',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Follow up Plan Item 1': {
    section: 'Plan',
    label: 'Follow up Plan Item 1',
    item: 'within 1 week OR FOLLOW UP IN DAYS',
    points: '1',
    guidance: '',
  },
  'Plan_Follow up Plan Item 2': {
    section: 'Plan',
    label: 'Follow up Plan Item 2',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Follow up Plan Item 3': {
    section: 'Plan',
    label: 'Follow up Plan Item 3',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Follow up Plan Item 4': {
    section: 'Plan',
    label: 'Follow up Plan Item 4',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Follow up Plan Item 5': {
    section: 'Plan',
    label: 'Follow up Plan Item 5',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Follow up Plan Item 6': {
    section: 'Plan',
    label: 'Follow up Plan Item 6',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Follow up Plan Item 7': {
    section: 'Plan',
    label: 'Follow up Plan Item 7',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Follow up Plan Item 8': {
    section: 'Plan',
    label: 'Follow up Plan Item 8',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Follow up Plan Item 9': {
    section: 'Plan',
    label: 'Follow up Plan Item 9',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Follow up Plan Item 10': {
    section: 'Plan',
    label: 'Follow up Plan Item 10',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Pt Ed Item 1': {
    section: 'Plan',
    label: 'Pt Ed Item 1',
    item: 'effects of alcohol withdrawal on seizures OR MARIJUANA CESSATION',
    points: '1',
    guidance: '',
  },
  'Plan_Pt Ed Item 2': {
    section: 'Plan',
    label: 'Pt Ed Item 2',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Pt Ed Item 3': {
    section: 'Plan',
    label: 'Pt Ed Item 3',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Pt Ed Item 4': {
    section: 'Plan',
    label: 'Pt Ed Item 4',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Pt Ed Item 5': {
    section: 'Plan',
    label: 'Pt Ed Item 5',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Humanistic- Item 1': {
    section: 'Plan',
    label: 'Humanistic- Item 1',
    item: 'stop driving a car or DMV form to stop driving privileges OR MASK AT WORK',
    points: '1',
    guidance: '',
  },
  'Plan_Humanistic- Item 2': {
    section: 'Plan',
    label: 'Humanistic- Item 2',
    item: 'healthy diet, vitamins OR SEEK EMERGENCY CARE INSTRUCTIONS GIVEN',
    points: '1',
    guidance: '',
  },
  'Plan_Humanistic- Item 3': {
    section: 'Plan',
    label: 'Humanistic- Item 3',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Humanistic- Item 4': {
    section: 'Plan',
    label: 'Humanistic- Item 4',
    item: '',
    points: '',
    guidance: '',
  },
  'Plan_Humanistic- Item 5': {
    section: 'Plan',
    label: 'Humanistic- Item 5',
    item: '',
    points: '',
    guidance: '',
  },
};

export default function GeneratePage() {
  const [uploadedData, setUploadedData] = useState<CSVRow[]>([]);
  const [generatedData, setGeneratedData] = useState<CSVRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isGenerated, setIsGenerated] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && results.data.length > 1) {
            const rows = results.data.slice(1) as string[][];
            const parsedData: CSVRow[] = [];
            let currentSection = '';

            rows.forEach((row, index) => {
              const colA = (row[0] || '').trim();
              const colB = (row[1] || '').trim();

              // If column A has a value, it's a section header
              if (colA) {
                currentSection = colA;
                console.log(`Row ${index}: Section changed to "${currentSection}"`);
              }

              // If column B has a value, it's a label (skip if it's just a subsection header with no data)
              if (colB) {
                const newRow = {
                  section: currentSection,
                  label: colB,
                  item: '',
                  points: '',
                  guidance: '',
                };
                parsedData.push(newRow);
                console.log(`Row ${index}: Added "${currentSection}_${colB}"`);
              }
            });

            setUploadedData(parsedData);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        },
      });
    }
  };

  const generateChecklist = () => {
    console.log('Available reference keys:', Object.keys(REFERENCE_DATA).slice(0, 10));
    console.log('Uploaded data sample:', uploadedData.slice(0, 10));

    const generated = uploadedData.map((row) => {
      const key = `${row.section}_${row.label}`;
      const reference = REFERENCE_DATA[key];

      if (!reference) {
        console.log('❌ No match for key:', key);
      } else {
        console.log('✅ Found match for key:', key);
      }

      if (reference) {
        return {
          ...row,
          item: reference.item,
          points: reference.points,
          guidance: reference.guidance,
        };
      }
      return row;
    });

    console.log('Generated data:', generated.slice(0, 5));
    setGeneratedData(generated);
    setIsGenerated(true);
  };

  const handleCellEdit = (
    rowIndex: number,
    field: keyof CSVRow,
    value: string
  ) => {
    const updated = [...generatedData];
    updated[rowIndex][field] = value;
    setGeneratedData(updated);
  };

  const downloadCSV = () => {
    const csvContent = [
      [
        'Student Input Fields Being Graded',
        'Checklist Item Form Label',
        'Enter the Case Specific Item',
        'Point Value (Enter 1 for points, or leave blank for zero points and/or not grading the item)',
        'Form Guidance (information for checklist builder)',
      ],
      ...generatedData.map((row) => [
        row.section,
        row.label,
        row.item,
        row.points,
        row.guidance,
      ]),
    ];

    const csv = Papa.unparse(csvContent);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'generated_checklist.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPoints = generatedData.reduce((sum, item) => {
    const points = parseFloat(item.points) || 0;
    return sum + points;
  }, 0);

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          linear-gradient(180deg, #2B3F47 0%, #0F131F 100%),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 40px),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 40px)
        `,
        backgroundSize: '100% 100%, 40px 40px, 40px 40px',
      }}
    >
      {/* Header */}
      <header className="border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 19, 31, 0.8)' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-white">NoteSage Sapient AI</div>
          </div>
          <div className="text-slate-300 text-sm">facultytest1@gmail.com</div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside
          className="w-64 border-r border-slate-700/50 min-h-[calc(100vh-73px)]"
          style={{
            background: `
              linear-gradient(180deg, #2B3F47 0%, #0F131F 100%),
              repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 40px),
              repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 40px)
            `,
            backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          }}
        >
          <div className="p-6">
            <h2 className="text-slate-400 text-sm font-semibold uppercase mb-4">Navigation</h2>
            <nav className="space-y-2">
              <a href="#" className="block px-4 py-2 text-slate-300 hover:bg-white/5 rounded transition-colors">
                Dashboard
              </a>
              <Link
                to="/"
                className="block px-4 py-2 rounded font-medium text-slate-900 hover:opacity-90 transition"
                style={{ backgroundColor: '#3DD1A5' }}
              >
                Events
              </Link>
              <a href="#" className="block px-4 py-2 text-slate-300 hover:bg-white/5 rounded transition-colors">
                Review Submissions
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <div className="text-slate-400 text-sm">
              <span className="text-slate-300">Faculty</span>
              <span className="mx-2">/</span>
              <span
                className="font-medium"
                style={{ color: '#3DD1A5' }}
              >
                Events
              </span>
              <span className="mx-2">/</span>
              <span className="text-slate-300">Generate</span>
            </div>
          </div>

          {/* Back Button */}
          <button className="mb-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium">
            ← Back to Event List
          </button>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-6">Generate Checklist</h1>

          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Upload CSV (Columns A & B Only)</h2>
            <div className="mb-4">
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-slate-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-slate-700 file:text-white
                  hover:file:bg-slate-600
                  file:cursor-pointer
                  cursor-pointer
                  border border-slate-600 rounded
                  bg-slate-800/50 p-2"
              />
            </div>
            {fileName && (
              <p className="text-slate-300 text-sm mb-4">
                Uploaded:{' '}
                <span style={{ color: '#3DD1A5' }}>{fileName}</span>
              </p>
            )}

            {uploadedData.length > 0 && !isGenerated && (
              <button
                onClick={generateChecklist}
                className="px-6 py-2 rounded font-medium text-slate-900 hover:opacity-90 transition"
                style={{ backgroundColor: '#3DD1A5' }}
              >
                Generate Checklist Items
              </button>
            )}

            {isGenerated && (
              <button
                onClick={downloadCSV}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                Download Generated CSV
              </button>
            )}
          </div>

          {/* Table */}
          {isGenerated && generatedData.length > 0 && (
            <div
              className="rounded-lg overflow-hidden mb-8"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(15, 19, 31, 0.6)',
              }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 px-6 pt-6">
                Generated Checklist (Editable)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(74, 85, 104, 0.5)' }}>
                      <th
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-200"
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                      >
                        Section
                      </th>
                      <th
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-200"
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                      >
                        Checklist Item Label
                      </th>
                      <th
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-200"
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                      >
                        Case Specific Item
                      </th>
                      <th
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-200"
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                      >
                        Points
                      </th>
                      <th
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-200"
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                      >
                        Guidance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedData.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="hover:bg-white/5 transition-colors"
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                      >
                        <td className="px-4 py-3 text-sm text-slate-300" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <input
                            type="text"
                            value={row.section}
                            onChange={(e) =>
                              handleCellEdit(rowIndex, 'section', e.target.value)
                            }
                            className="w-full bg-slate-700/50 text-slate-200 px-2 py-1 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <input
                            type="text"
                            value={row.label}
                            onChange={(e) =>
                              handleCellEdit(rowIndex, 'label', e.target.value)
                            }
                            className="w-full bg-slate-700/50 text-slate-200 px-2 py-1 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <input
                            type="text"
                            value={row.item}
                            onChange={(e) =>
                              handleCellEdit(rowIndex, 'item', e.target.value)
                            }
                            className="w-full bg-slate-700/50 text-slate-200 px-2 py-1 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <input
                            type="text"
                            value={row.points}
                            onChange={(e) =>
                              handleCellEdit(rowIndex, 'points', e.target.value)
                            }
                            className="w-full bg-slate-700/50 text-slate-200 px-2 py-1 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">
                          <input
                            type="text"
                            value={row.guidance}
                            onChange={(e) =>
                              handleCellEdit(rowIndex, 'guidance', e.target.value)
                            }
                            className="w-full bg-slate-700/50 text-slate-200 px-2 py-1 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          {isGenerated && (
            <div className="flex items-center justify-between">
              <div className="text-slate-300">
                Total Points: <span className="font-semibold text-white">{totalPoints.toFixed(0)}</span>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium">
                  Previous
                </button>
                <button
                  onClick={downloadCSV}
                  className="px-6 py-2 rounded font-medium text-slate-900 hover:opacity-90 transition"
                  style={{ backgroundColor: '#3DD1A5' }}
                >
                  Download CSV
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

