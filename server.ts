import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db';
import {
  analyzePlantHealth,
  calculateStorageProfit,
  generateAdvisoryResponse,
  generateMultiTurnChatResponse,
  CHATBOT_ROLES_CONFIG,
  generateCropRotationAI,
  generateAdvancedCropRotationAdvisory,
  generateYieldPredictionAI,
  generatePestRiskPredictionAI,
} from './src/server/ai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Request logger & audit helper
  app.use((req, res, next) => {
    next();
  });

  // ==========================================
  // 1. HEALTH & SYSTEM MONITORING
  // ==========================================
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/admin/system-health', (req: Request, res: Response) => {
    const health = db.getSystemHealth();
    res.json(health);
  });

  app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
    res.json(db.auditLogs);
  });

  // ==========================================
  // 2. AUTH & USER ROLES
  // ==========================================
  app.get('/api/users', (req: Request, res: Response) => {
    res.json(db.users);
  });

  app.get('/api/users/current', (req: Request, res: Response) => {
    const role = (req.query.role as string) || 'farmer';
    const user = db.users.find((u) => u.role === role) || db.users[0];
    const farmerProfile = db.farmerProfiles.find((f) => f.user_id === user.id);
    const providerProfile = db.providerProfiles.find((p) => p.user_id === user.id);

    res.json({
      user,
      farmerProfile: farmerProfile || db.farmerProfiles[0],
      providerProfile: providerProfile || db.providerProfiles[0],
    });
  });

  // ==========================================
  // 3. WAREHOUSES & CAPACITY & BOOKINGS
  // ==========================================
  app.get('/api/warehouses', (req: Request, res: Response) => {
    const { lat, lng, radius, crop, quantity, storageType, maxPrice, sort } = req.query;

    const userLat = lat ? parseFloat(lat as string) : 10.6586; // default Pollachi/Coimbatore
    const userLng = lng ? parseFloat(lng as string) : 77.0089;

    const results = db.searchNearbyWarehouses({
      lat: userLat,
      lng: userLng,
      radiusKm: radius ? parseFloat(radius as string) : undefined,
      crop: crop as string,
      quantityKg: quantity ? parseFloat(quantity as string) : undefined,
      storageType: storageType as string,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      sortBy: (sort as any) || 'distance',
    });

    res.json(results);
  });

  app.get('/api/warehouses/:id', (req: Request, res: Response) => {
    const wh = db.warehouses.find((w) => w.id === req.params.id);
    if (!wh) return res.status(404).json({ error: 'Warehouse not found' });
    res.json(wh);
  });

  app.post('/api/warehouses', (req: Request, res: Response) => {
    const data = req.body;
    const newWh = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      provider_id: data.provider_id || 'usr_provider_1',
      name: data.name,
      operator_type: data.operator_type || 'SWC',
      address: data.address,
      taluk: data.taluk,
      district: data.district,
      state: data.state,
      pincode: data.pincode,
      latitude: parseFloat(data.latitude) || 10.6586,
      longitude: parseFloat(data.longitude) || 77.0089,
      storage_types: data.storage_types || ['General Warehouse'],
      total_capacity_kg: parseFloat(data.total_capacity_kg) || 200000,
      used_capacity_kg: 0,
      available_capacity_kg: parseFloat(data.total_capacity_kg) || 200000,
      pricing_model: data.pricing_model || 'per_kg_per_day',
      rate_inr: parseFloat(data.rate_inr) || 0.45,
      minimum_storage_days: parseInt(data.minimum_storage_days) || 7,
      suitable_crops: data.suitable_crops || ['Paddy', 'Maize', 'Tomato'],
      humidity_control: !!data.humidity_control,
      security_and_cctv: true,
      weighbridge_available: true,
      fumigation_service: true,
      insurance_covered: true,
      rating: 5.0,
      verified: true,
      contact_person: data.contact_person || 'Facility Head',
      contact_phone: data.contact_phone || '+91 94420 00000',
      is_demo: false,
    };

    db.warehouses.push(newWh as any);
    db.logAudit(newWh.provider_id, 'provider', 'provider', 'CREATE_WAREHOUSE', 'warehouses', newWh.id, { name: newWh.name });
    res.status(201).json(newWh);
  });

  // Calculate storage profit
  app.post('/api/warehouses/profit-calculator', (req: Request, res: Response) => {
    const {
      cropName,
      quantityKg,
      currentMandiPricePerKg,
      projectedFuturePricePerKg,
      storageDurationDays,
      storageRatePerKgDay,
      transportCostInr,
    } = req.body;

    const result = calculateStorageProfit({
      cropName: cropName || 'Tomato',
      quantityKg: parseFloat(quantityKg) || 1000,
      currentMandiPricePerKg: parseFloat(currentMandiPricePerKg) || 20,
      projectedFuturePricePerKg: parseFloat(projectedFuturePricePerKg) || 28,
      storageDurationDays: parseInt(storageDurationDays) || 30,
      storageRatePerKgDay: parseFloat(storageRatePerKgDay) || 0.45,
      transportCostInr: parseFloat(transportCostInr) || 800,
    });

    res.json(result);
  });

  // Warehouse Bookings
  app.get('/api/bookings', (req: Request, res: Response) => {
    const { farmerId, providerId } = req.query;
    let list = db.warehouseBookings;
    if (farmerId) list = list.filter((b) => b.farmer_id === farmerId);
    if (providerId) {
      const whIds = db.warehouses.filter((w) => w.provider_id === providerId).map((w) => w.id);
      list = list.filter((b) => whIds.includes(b.warehouse_id));
    }
    res.json(list);
  });

  app.post('/api/bookings', (req: Request, res: Response) => {
    const result = db.createWarehouseBooking(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json(result.booking);
  });

  app.patch('/api/bookings/:id/status', (req: Request, res: Response) => {
    const { status, providerNotes, userId } = req.body;
    const result = db.updateBookingStatus(req.params.id, status, providerNotes, userId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result.booking);
  });

  // ==========================================
  // 4. PLANT SCANS & COMPUTER VISION
  // ==========================================
  app.get('/api/plant-scans', (req: Request, res: Response) => {
    const { farmerId } = req.query;
    let list = db.plantScans;
    if (farmerId) list = list.filter((s) => s.farmer_id === farmerId);
    res.json(list);
  });

  app.post('/api/plant-scans/analyze', async (req: Request, res: Response) => {
    try {
      const { imageBase64, imageUrl, cropName, plantPart, farmerId, language, farmerNotes, preferredModel } = req.body;

      const diagnosis = await analyzePlantHealth({
        imageBase64,
        imageUrl,
        cropName: cropName || 'Tomato',
        plantPart: plantPart || 'leaf',
        language,
        farmerNotes,
        preferredModel,
      });

      const newScan: any = {
        id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        farmer_id: farmerId || 'usr_farmer_1',
        created_at: new Date().toISOString(),
        ...diagnosis,
      };

      db.plantScans.unshift(newScan);
      db.logAudit(newScan.farmer_id, 'farmer', 'farmer', 'CREATE_PLANT_SCAN', 'plant_scans', newScan.id, {
        crop: newScan.crop_name,
        predicted_issue: newScan.predicted_issue,
        confidence: newScan.confidence,
      });

      // Send notification
      db.sendNotification(
        newScan.farmer_id,
        `Plant Scan Diagnosis: ${newScan.predicted_issue}`,
        `Analysis completed with ${newScan.confidence}% confidence. View agronomic action steps.`,
        'disease_scan',
        'plant-scanner'
      );

      res.status(201).json(newScan);
    } catch (err: any) {
      console.error('Error analyzing plant health:', err);
      res.status(500).json({ error: err.message || 'Internal analysis error' });
    }
  });

  app.post('/api/plant-scans/:id/feedback', (req: Request, res: Response) => {
    const scan = db.plantScans.find((s) => s.id === req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });

    scan.farmer_feedback = req.body.feedback;
    if (req.body.correctionNotes) scan.farmer_correction_notes = req.body.correctionNotes;

    db.logAudit(scan.farmer_id, 'farmer', 'farmer', 'SUBMIT_SCAN_FEEDBACK', 'plant_scans', scan.id, {
      feedback: req.body.feedback,
    });

    res.json({ success: true, scan });
  });

  // ==========================================
  // 5. SOIL LABS & SOIL TESTS
  // ==========================================
  app.get('/api/soil-labs', (req: Request, res: Response) => {
    res.json(db.soilLabs);
  });

  app.get('/api/soil-tests', (req: Request, res: Response) => {
    const { farmerId } = req.query;
    let list = db.soilTests;
    if (farmerId) list = list.filter((s) => s.farmer_id === farmerId);
    res.json(list);
  });

  app.post('/api/soil-tests/request', (req: Request, res: Response) => {
    const data = req.body;
    const newReq = {
      id: `str_${Date.now()}`,
      farmer_id: data.farmerId || 'usr_farmer_1',
      farmer_name: data.farmerName || 'Murugan Palaniswamy',
      farmer_phone: data.farmerPhone || '+91 98421 87654',
      lab_id: data.labId,
      field_id: data.fieldId || 'field_1',
      sample_collection_type: data.collectionType || 'lab_pickup',
      pickup_address: data.pickupAddress || 'Pollachi Rural',
      selected_package: data.packageName || 'Comprehensive Soil Health (12 Parameters)',
      estimated_cost: data.cost || 50,
      status: 'REQUESTED',
      created_at: new Date().toISOString(),
    };
    db.soilTestRequests.unshift(newReq as any);
    db.logAudit(newReq.farmer_id, newReq.farmer_phone, 'farmer', 'REQUEST_SOIL_TEST', 'soil_test_requests', newReq.id, {
      lab_id: data.labId,
    });

    db.sendNotification(
      newReq.farmer_id,
      'Soil Test Request Submitted',
      `Your sample collection request #${newReq.id} has been registered with the soil testing laboratory.`,
      'soil_report',
      'soil'
    );

    res.status(201).json(newReq);
  });

  // ==========================================
  // 6. CROPS & ROTATION & FARMS
  // ==========================================
  app.get('/api/farms', (req: Request, res: Response) => {
    const { farmerId } = req.query;
    let list = db.farms;
    if (farmerId) list = list.filter((f) => f.farmer_id === farmerId);
    res.json(list);
  });

  app.get('/api/fields', (req: Request, res: Response) => {
    res.json(db.fields);
  });

  app.get('/api/crop-rotations', (req: Request, res: Response) => {
    res.json(db.cropRotations);
  });

  // Intelligent Crop Rotation Advisor Recommendations (Soil & Climate Driven)
  app.get('/api/crop-rotations/advisor', (req: Request, res: Response) => {
    try {
      const {
        fieldId,
        farmerId,
        soilType,
        ph,
        nitrogenKgHa,
        phosphorusKgHa,
        potassiumKgHa,
        organicCarbonPercent,
        currentCrop,
        targetSeason,
        expectedRainfall,
        waterSource,
        irrigationCapacity,
        priorityFocus,
      } = req.query;

      const soilNutrients: any = {};
      if (soilType) soilNutrients.soil_type = soilType as string;
      if (ph) soilNutrients.ph = parseFloat(ph as string);
      if (nitrogenKgHa) soilNutrients.nitrogen_kg_ha = parseFloat(nitrogenKgHa as string);
      if (phosphorusKgHa) soilNutrients.phosphorus_kg_ha = parseFloat(phosphorusKgHa as string);
      if (potassiumKgHa) soilNutrients.potassium_kg_ha = parseFloat(potassiumKgHa as string);
      if (organicCarbonPercent) soilNutrients.organic_carbon_percent = parseFloat(organicCarbonPercent as string);

      const seasonalParams: any = {};
      if (currentCrop) seasonalParams.current_standing_crop = currentCrop as string;
      if (targetSeason) seasonalParams.target_season = targetSeason as any;
      if (expectedRainfall) seasonalParams.expected_rainfall_trend = expectedRainfall as any;
      if (waterSource) seasonalParams.water_source = waterSource as string;
      if (irrigationCapacity) seasonalParams.irrigation_capacity = irrigationCapacity as any;
      if (priorityFocus) seasonalParams.priority_focus = priorityFocus as any;

      const recommendations = db.getSmartCropRotationRecommendations({
        fieldId: fieldId as string,
        farmerId: farmerId as string,
        soilNutrients,
        seasonalParams,
      });

      res.json(recommendations);
    } catch (err: any) {
      console.error('Error computing crop rotation advisory:', err);
      res.status(500).json({ error: 'Failed to compute crop rotation recommendations' });
    }
  });

  // AI-Powered Multimodal Crop Rotation & Succession Plan Generation
  app.post('/api/crop-rotations/advisor/ai-generate', async (req: Request, res: Response) => {
    try {
      const { soil, seasonal, fieldAreaAcres, recentScanFindings } = req.body;

      if (!soil || !seasonal) {
        return res.status(400).json({ error: 'Missing soil or seasonal parameters' });
      }

      // Try Gemini 3.7 Flash advanced agronomic prompt
      const aiResult = await generateAdvancedCropRotationAdvisory({
        soil,
        seasonal,
        fieldAreaAcres: parseFloat(fieldAreaAcres) || 6.5,
        recentScanFindings,
      });

      if (aiResult) {
        return res.json({
          source: 'GEMINI_3.7_FLASH',
          data: aiResult,
        });
      }

      // Seamless fallback to deterministic agronomic engine
      const deterministicResult = db.getSmartCropRotationRecommendations({
        soilNutrients: soil,
        seasonalParams: seasonal,
      });

      return res.json({
        source: 'AGRONOMIC_ENGINE_FALLBACK',
        data: deterministicResult,
      });
    } catch (err: any) {
      console.error('Error generating AI rotation advice:', err);
      res.status(500).json({ error: 'Crop rotation AI service error' });
    }
  });

  // Save selected crop rotation succession plan
  app.post('/api/crop-rotations/save-plan', (req: Request, res: Response) => {
    try {
      const { fieldId, farmerId, planName, soilTypeTarget, recommendedSequence, rationale } = req.body;

      const newPlan = {
        id: `rot_plan_${Date.now()}`,
        field_id: fieldId || 'fld_1',
        farm_id: 'farm_1',
        plan_name: planName || 'Intelligent Soil Restorative Rotation Plan',
        current_crop: req.body.currentCrop || 'Tomato',
        soil_type_target: soilTypeTarget || 'Red Sandy Loam',
        seasons_cycle_count: (recommendedSequence && recommendedSequence.length) || 4,
        recommended_sequence: recommendedSequence || [],
        rationale: rationale || 'Optimized for biological nitrogen fixation and pathogen disruption.',
        created_at: new Date().toISOString(),
      };

      db.cropRotations.unshift(newPlan as any);
      db.logAudit(farmerId || 'usr_farmer_1', 'Murugan Palaniswamy', 'farmer', 'CREATE_CROP_ROTATION_PLAN', 'crop_rotations', newPlan.id, {
        plan_name: newPlan.plan_name,
        target_soil: newPlan.soil_type_target,
      });

      db.sendNotification(
        farmerId || 'usr_farmer_1',
        'Crop Rotation Plan Saved',
        `Plan "${newPlan.plan_name}" has been mapped to Field #${newPlan.field_id}.`,
        'crop_plan',
        'crops'
      );

      res.status(201).json(newPlan);
    } catch (err: any) {
      console.error('Error saving rotation plan:', err);
      res.status(500).json({ error: 'Failed to save rotation plan' });
    }
  });

  // ==========================================
  // 6.5. AI 60-DAY CROP GROWTH & YIELD PREDICTION
  // ==========================================
  app.post('/api/ai/predict-yield', async (req: Request, res: Response) => {
    try {
      const input = req.body;
      const result = await generateYieldPredictionAI(input);

      // Automatically store in history
      db.yieldPredictions.unshift(result);
      if (db.yieldPredictions.length > 50) db.yieldPredictions.pop();

      db.logAudit(
        input.farmerId || 'usr_farmer_1',
        'Murugan Palaniswamy',
        'farmer',
        'GENERATE_YIELD_PREDICTION',
        'yield_predictions',
        result.id,
        {
          crop: result.cropName,
          predicted_quintals_per_acre: result.predictedYieldQuintalsPerAcre,
          total_quintals: result.totalExpectedYieldQuintals,
        }
      );

      res.json(result);
    } catch (err: any) {
      console.error('Error in yield prediction route:', err);
      res.status(500).json({ error: 'Failed to generate 60-day yield forecast' });
    }
  });

  app.get('/api/yield-predictions', (req: Request, res: Response) => {
    const { farmerId } = req.query;
    let list = db.yieldPredictions;
    if (farmerId) list = list.filter((p) => p.farmerId === farmerId);
    res.json(list);
  });

  app.post('/api/yield-predictions/save', (req: Request, res: Response) => {
    try {
      const prediction = req.body;
      if (!prediction.id) prediction.id = `yp_${Date.now()}`;
      
      const existingIdx = db.yieldPredictions.findIndex((p) => p.id === prediction.id);
      if (existingIdx >= 0) {
        db.yieldPredictions[existingIdx] = prediction;
      } else {
        db.yieldPredictions.unshift(prediction);
      }

      db.sendNotification(
        prediction.farmerId || 'usr_farmer_1',
        '60-Day Yield Forecast Saved',
        `Yield forecast for ${prediction.cropName} (${prediction.predictedYieldQuintalsPerAcre} Qtl/Acre) saved with 5 milestone interventions.`,
        'yield_prediction',
        'yield-prediction'
      );

      res.status(201).json(prediction);
    } catch (err: any) {
      console.error('Error saving yield prediction:', err);
      res.status(500).json({ error: 'Failed to save yield prediction' });
    }
  });

  // ==========================================
  // 6.6. AI PEST RISK PREDICTION & ORGANIC MANAGEMENT
  // ==========================================
  app.post('/api/ai/predict-pest-risk', async (req: Request, res: Response) => {
    try {
      const input = req.body;
      const result = await generatePestRiskPredictionAI(input);

      // Automatically push into database record collection
      db.pestRiskAssessments.unshift(result);
      if (db.pestRiskAssessments.length > 50) db.pestRiskAssessments.pop();

      db.logAudit(
        input.farmerId || 'usr_farmer_1',
        'Murugan Palaniswamy',
        'farmer',
        'GENERATE_PEST_RISK_PREDICTION',
        'pest_risk_assessments',
        result.id,
        {
          crop: result.cropName,
          risk_level: result.overallRiskLevel,
          pest_index: result.overallFarmPestIndex,
          top_pest: result.identifiedPests[0]?.pestOrDiseaseName,
        }
      );

      // Trigger high priority notification if risk is CRITICAL or HIGH
      if (result.overallRiskLevel === 'CRITICAL' || result.overallRiskLevel === 'HIGH') {
        db.sendNotification(
          input.farmerId || 'usr_farmer_1',
          `⚠️ Urgent: ${result.overallRiskLevel} Pest Risk for ${result.cropName}`,
          result.immediateAlertHeading,
          'pest_alert',
          'pest-risk'
        );
      }

      res.json(result);
    } catch (err: any) {
      console.error('Error in pest risk prediction route:', err);
      res.status(500).json({ error: 'Failed to generate pest risk prediction' });
    }
  });

  app.get('/api/pest-risks', (req: Request, res: Response) => {
    const { farmerId } = req.query;
    let list = db.pestRiskAssessments;
    if (farmerId) list = list.filter((p) => p.farmerId === farmerId);
    res.json(list);
  });

  app.post('/api/pest-risks/save', (req: Request, res: Response) => {
    try {
      const assessment = req.body;
      if (!assessment.id) assessment.id = `pra_${Date.now()}`;

      const existingIdx = db.pestRiskAssessments.findIndex((p) => p.id === assessment.id);
      if (existingIdx >= 0) {
        db.pestRiskAssessments[existingIdx] = assessment;
      } else {
        db.pestRiskAssessments.unshift(assessment);
      }

      db.sendNotification(
        assessment.farmerId || 'usr_farmer_1',
        'Pest Risk Advisory Saved',
        `Bio-management plan saved for ${assessment.cropName} (${assessment.overallRiskLevel} Risk Index: ${assessment.overallFarmPestIndex}/100).`,
        'pest_alert',
        'pest-risk'
      );

      res.status(201).json(assessment);
    } catch (err: any) {
      console.error('Error saving pest risk assessment:', err);
      res.status(500).json({ error: 'Failed to save pest risk assessment' });
    }
  });

  app.patch('/api/pest-risks/:id/checklist/:taskId', (req: Request, res: Response) => {
    try {
      const { id, taskId } = req.params;
      const { status } = req.body;
      const assessment = db.pestRiskAssessments.find((p) => p.id === id);
      if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

      const task = assessment.weeklyScoutingChecklist.find((t) => t.id === taskId);
      if (task) {
        task.status = status || (task.status === 'completed' ? 'pending' : 'completed');
      }

      res.json({ success: true, assessment });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/crop-history', (req: Request, res: Response) => {
    res.json(db.cropHistories);
  });

  // ==========================================
  // 7. GOVERNMENT SCHEMES
  // ==========================================
  app.get('/api/schemes', (req: Request, res: Response) => {
    res.json(db.governmentSchemes);
  });

  app.get('/api/scheme-applications', (req: Request, res: Response) => {
    const { farmerId } = req.query;
    let list = db.schemeApplications;
    if (farmerId) list = list.filter((a) => a.farmer_id === farmerId);
    res.json(list);
  });

  app.post('/api/scheme-applications', (req: Request, res: Response) => {
    const data = req.body;
    const newAppl = {
      id: `appl_${Date.now()}`,
      application_number: `TN-AGRI-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      scheme_id: data.schemeId,
      scheme_title: data.schemeTitle,
      farmer_id: data.farmerId || 'usr_farmer_1',
      farmer_name: data.farmerName || 'Murugan Palaniswamy',
      land_area_acres: parseFloat(data.landArea) || 6.5,
      aadhaar_last_four: data.aadhaarLastFour || '7654',
      bank_account_verified: true,
      status: 'SUBMITTED',
      submitted_date: new Date().toISOString().split('T')[0],
      updated_date: new Date().toISOString().split('T')[0],
      remarks: 'Application received and queued for Village Administrative Officer (VAO) endorsement.',
    };

    db.schemeApplications.unshift(newAppl as any);
    db.logAudit(newAppl.farmer_id, newAppl.farmer_name, 'farmer', 'SUBMIT_SCHEME_APPLICATION', 'scheme_applications', newAppl.id, {
      scheme: data.schemeTitle,
    });

    db.sendNotification(
      newAppl.farmer_id,
      'Scheme Application Submitted',
      `Application #${newAppl.application_number} for ${data.schemeTitle} has been submitted for verification.`,
      'scheme',
      'schemes'
    );

    res.status(201).json(newAppl);
  });

  // ==========================================
  // 8. MARKET PRICES, PRICE ALERTS & BUYERS
  // ==========================================
  app.get('/api/markets/prices', (req: Request, res: Response) => {
    const { district, commodity, state, lat, lng } = req.query;
    const rates = db.fetchLiveMarketRates({
      district: district as string,
      commodity: commodity as string,
      state: state as string,
      userLat: lat ? parseFloat(lat as string) : undefined,
      userLng: lng ? parseFloat(lng as string) : undefined,
    });
    res.json(rates);
  });

  // Fetch current price alert rules configured by farmer
  app.get('/api/markets/alerts/rules', (req: Request, res: Response) => {
    const { userId } = req.query;
    const rules = db.getPriceAlertRules((userId as string) || 'usr_farmer_1');
    res.json(rules);
  });

  // Create a new price alert subscription
  app.post('/api/markets/alerts/rules', (req: Request, res: Response) => {
    try {
      const result = db.createPriceAlertRule(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create price alert rule' });
    }
  });

  // Update/toggle price alert rule (e.g. pause, resume, edit target price)
  app.patch('/api/markets/alerts/rules/:id', (req: Request, res: Response) => {
    try {
      const result = db.updatePriceAlertRule(req.params.id, req.body);
      if (!result.success) return res.status(404).json(result);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete price alert rule
  app.delete('/api/markets/alerts/rules/:id', (req: Request, res: Response) => {
    try {
      const result = db.deletePriceAlertRule(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get historical triggered price alerts
  app.get('/api/markets/alerts/history', (req: Request, res: Response) => {
    const { userId } = req.query;
    const history = db.getTriggeredAlerts((userId as string) || 'usr_farmer_1');
    res.json(history);
  });

  // Mark triggered price alert as read
  app.patch('/api/markets/alerts/history/:id/read', (req: Request, res: Response) => {
    const result = db.markTriggeredAlertRead(req.params.id);
    res.json(result);
  });

  // Real-time evaluation & trigger dispatch
  app.post('/api/markets/alerts/check-now', (req: Request, res: Response) => {
    try {
      const { userId, simulatedUpdates } = req.body;
      const result = db.checkAndTriggerPriceAlerts({
        userId: userId || 'usr_farmer_1',
        simulatedUpdates,
      });
      res.json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to check price alerts' });
    }
  });

  // Fetch live market rate stream & simulate price fluctuations
  app.post('/api/markets/rates/fetch-live', (req: Request, res: Response) => {
    try {
      const { fluctuateRandomly } = req.body;
      let simulatedUpdates: Array<{ commodity: string; mandiName?: string; newPrice: number; changePercent?: number }> = [];

      if (fluctuateRandomly) {
        // Apply realistic micro-swings to simulate real-time ticker updates
        db.marketPrices.forEach((item) => {
          const swingPercent = Math.round((Math.random() * 6 - 2.5) * 10) / 10; // -2.5% to +3.5%
          const baseModal = item.modal_price_per_quintal || item.modal_price_inr || 2200;
          const newPrice = Math.round(baseModal * (1 + swingPercent / 100));
          simulatedUpdates.push({
            commodity: item.commodity,
            mandiName: item.mandi_name,
            newPrice,
            changePercent: swingPercent,
          });
        });
      }

      const alertCheckResult = db.checkAndTriggerPriceAlerts({
        userId: 'usr_farmer_1',
        simulatedUpdates: simulatedUpdates.length > 0 ? simulatedUpdates : undefined,
      });

      const liveRates = db.fetchLiveMarketRates();

      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        rates: liveRates,
        newlyTriggeredAlerts: alertCheckResult.alerts,
        triggeredCount: alertCheckResult.triggeredCount,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/buyers', (req: Request, res: Response) => {
    res.json(db.buyerListings);
  });

  app.get('/api/crop-listings', (req: Request, res: Response) => {
    res.json(db.cropListings);
  });

  app.post('/api/crop-listings', (req: Request, res: Response) => {
    const data = req.body;
    const newListing = {
      id: `cl_${Date.now()}`,
      farmer_id: data.farmerId || 'usr_farmer_1',
      farmer_name: data.farmerName || 'Murugan Palaniswamy',
      crop_name: data.cropName,
      variety: data.variety || 'Hybrid Regular',
      quantity_quintals: parseFloat(data.quantityQuintals) || 10,
      expected_price_per_quintal: parseFloat(data.expectedPrice) || 2400,
      harvest_date: data.harvestDate || new Date().toISOString().split('T')[0],
      storage_location: data.storageLocation || 'Farm On-site Storage',
      quality_grade: data.qualityGrade || 'Grade A',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    db.cropListings.unshift(newListing as any);
    db.logAudit(newListing.farmer_id, newListing.farmer_name, 'farmer', 'CREATE_CROP_LISTING', 'crop_listings', newListing.id, {
      crop: newListing.crop_name,
      quantity: newListing.quantity_quintals,
    });

    res.status(201).json(newListing);
  });

  // ==========================================
  // 9. AI ADVISORY MULTI-TURN CHAT & ROLES
  // ==========================================
  app.get('/api/ai/chat/roles', (req: Request, res: Response) => {
    const rolesList = Object.entries(CHATBOT_ROLES_CONFIG).map(([id, config]) => ({
      id,
      name: config.name,
      title: config.title,
      defaultTier: config.defaultTier,
      recommendedModel: config.recommendedModel,
      defaultSuggestions: config.defaultSuggestions,
    }));
    res.json(rolesList);
  });

  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const { message, history, roleId, taskTier, preferredModel, language, farmerContext } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const result = await generateMultiTurnChatResponse({
        message,
        history,
        roleId,
        taskTier,
        preferredModel,
        language: language || 'English',
        farmerContext,
      });

      // Audit log chat interaction
      const farmerId = farmerContext?.id || farmerContext?.farmerId || 'usr_farmer_1';
      const farmerName = farmerContext?.name || farmerContext?.farmerName || 'Murugan Palaniswamy';
      db.logAudit(
        farmerId,
        farmerName,
        'farmer',
        'AI_CHAT_INTERACTION',
        'ai_conversations',
        `chat_${Date.now()}`,
        {
          role_id: result.roleId,
          model_used: result.modelUsed,
          task_tier: result.taskTier,
          query_snippet: message.slice(0, 80),
        }
      );

      res.json(result);
    } catch (err: any) {
      console.error('Error generating AI advice:', err);
      res.status(500).json({ error: 'AI advisory error' });
    }
  });

  app.post('/api/ai/crop-rotation', async (req: Request, res: Response) => {
    try {
      const { soilType, currentCrop, landAreaAcres, waterAvailability } = req.body;
      const plan = await generateCropRotationAI({
        soilType: soilType || 'Red Sandy Loam',
        currentCrop: currentCrop || 'Tomato',
        landAreaAcres: parseFloat(landAreaAcres) || 6.5,
        waterAvailability: waterAvailability || 'Borewell + Drip Irrigation',
      });
      if (plan) {
        db.cropRotations.unshift(plan);
        return res.json(plan);
      }
      return res.json(db.cropRotations[0]);
    } catch (err: any) {
      console.error('Error generating AI crop rotation:', err);
      res.status(500).json({ error: 'Failed to generate AI crop rotation plan' });
    }
  });

  // ==========================================
  // 10. NOTIFICATIONS
  // ==========================================
  app.get('/api/notifications', (req: Request, res: Response) => {
    const { userId } = req.query;
    let list = db.notifications;
    if (userId) list = list.filter((n) => n.user_id === userId);
    res.json(list);
  });

  app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
    const notif = db.notifications.find((n) => n.id === req.params.id);
    if (notif) notif.is_read = true;
    res.json({ success: true });
  });

  // ==========================================
  // 10B. ADMIN INQUIRIES & HELPDESK
  // ==========================================
  app.get('/api/inquiries', (req: Request, res: Response) => {
    const { senderId, senderRole, status } = req.query;
    let list = [...db.inquiries];
    if (senderId) list = list.filter((i) => i.sender_id === senderId);
    if (senderRole) list = list.filter((i) => i.sender_role === senderRole);
    if (status) list = list.filter((i) => i.status === status);
    res.json(list);
  });

  app.get('/api/inquiries/:id', (req: Request, res: Response) => {
    const item = db.inquiries.find((i) => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Inquiry ticket not found' });
    res.json(item);
  });

  app.post('/api/inquiries', (req: Request, res: Response) => {
    try {
      const { senderId, senderName, senderEmail, senderPhone, senderRole, subject, category, priority, initialMessage } = req.body;
      if (!subject || !initialMessage || !senderId) {
        return res.status(400).json({ error: 'Missing required inquiry parameters' });
      }

      const inquiry = db.createInquiry({
        senderId,
        senderName: senderName || 'User',
        senderEmail,
        senderPhone,
        senderRole: senderRole || 'farmer',
        subject,
        category: category || 'GENERAL',
        priority: priority || 'MEDIUM',
        initialMessage,
      });

      res.status(201).json(inquiry);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/inquiries/:id/reply', (req: Request, res: Response) => {
    try {
      const { senderId, senderName, senderRole, content, visualPayload } = req.body;
      if (!content) return res.status(400).json({ error: 'Reply content cannot be empty' });

      const result = db.replyToInquiry({
        inquiryId: req.params.id,
        senderId: senderId || 'usr_user',
        senderName: senderName || 'User',
        senderRole: senderRole || 'farmer',
        content,
        visualPayload,
      });

      if (!result.success) return res.status(400).json({ error: result.error });
      res.json(result.inquiry);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/inquiries/:id/status', (req: Request, res: Response) => {
    const { status, adminUserId } = req.body;
    const result = db.updateInquiryStatus(req.params.id, status, adminUserId);
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json(result.inquiry);
  });

  // ==========================================
  // 10C. DEMAND CROPS & HARVEST ESTIMATES
  // ==========================================
  app.get('/api/demand-crops', (req: Request, res: Response) => {
    const { category } = req.query;
    let list = db.demandCropSuggestions;
    if (category) list = list.filter((c) => c.category.toLowerCase() === (category as string).toLowerCase());
    res.json(list);
  });

  app.get('/api/harvest-estimate', (req: Request, res: Response) => {
    const { cropName, sowingDate, variety } = req.query;
    const sow = (sowingDate as string) || new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const crop = (cropName as string) || 'Tomato';
    const estimate = db.estimateHarvestTimeline(crop, sow, variety as string);
    res.json(estimate);
  });

  // ==========================================
  // CROP GROWTH TRACKER & HARVEST CYCLE APIS
  // ==========================================
  app.get('/api/crop-tracker/logs', (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || 'usr_farmer_1';
    const logs = db.getCropGrowthLogs(userId);
    res.json(logs);
  });

  app.post('/api/crop-tracker/logs', (req: Request, res: Response) => {
    const newLog = db.createCropGrowthLog(req.body);
    res.status(201).json(newLog);
  });

  app.patch('/api/crop-tracker/logs/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const result = db.updateCropGrowthLog(id, req.body);
    if (!result.success) return res.status(404).json({ error: result.error });
    res.json(result.log);
  });

  app.delete('/api/crop-tracker/logs/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const result = db.deleteCropGrowthLog(id);
    if (!result.success) return res.status(404).json({ error: result.error });
    res.json({ success: true, message: 'Crop growth log deleted successfully' });
  });

  app.post('/api/crop-tracker/logs/:id/toggle-task', (req: Request, res: Response) => {
    const { id } = req.params;
    const { stageId, taskId, completed } = req.body;
    const result = db.toggleCropGrowthTask(id, stageId, taskId, completed);
    if (!result.success) return res.status(404).json({ error: 'Crop log, stage, or task not found' });
    res.json(result.log);
  });

  app.get('/api/crop-tracker/profiles', (_req: Request, res: Response) => {
    res.json(db.getCropProfiles());
  });


  // ==========================================
  // 10D. REAL-TIME WEATHER & OPTIMAL PLANTING
  // ==========================================
  app.get('/api/weather', (req: Request, res: Response) => {
    const { lat, lng, locationName } = req.query;
    const userLat = lat ? parseFloat(lat as string) : 10.6586;
    const userLng = lng ? parseFloat(lng as string) : 77.0089;
    const locName = (locationName as string) || undefined;

    const weatherData = db.getRealTimeWeatherAndPlantingSuggestions(userLat, userLng, locName);
    res.json(weatherData);
  });


  // ==========================================
  // 11. ADMIN DATABASE TABLE VIEW API
  // ==========================================
  app.get('/api/admin/tables/:tableName', (req: Request, res: Response) => {
    const { tableName } = req.params;
    const { search, page, limit, sortKey, sortDir, filterDemo } = req.query;

    let records: any[] = [];
    switch (tableName) {
      case 'users':
        records = [...db.users];
        break;
      case 'farmer_profiles':
        records = [...db.farmerProfiles];
        break;
      case 'provider_profiles':
        records = [...db.providerProfiles];
        break;
      case 'farms':
        records = [...db.farms];
        break;
      case 'fields':
        records = [...db.fields];
        break;
      case 'crop_history':
        records = [...db.cropHistories];
        break;
      case 'crop_rotations':
        records = [...db.cropRotations];
        break;
      case 'yield_predictions':
        records = [...db.yieldPredictions];
        break;
      case 'pest_risk_assessments':
        records = [...db.pestRiskAssessments];
        break;
      case 'soil_tests':
        records = [...db.soilTests];
        break;
      case 'soil_labs':
        records = [...db.soilLabs];
        break;
      case 'soil_test_requests':
        records = [...db.soilTestRequests];
        break;
      case 'plant_scans':
        records = [...db.plantScans];
        break;
      case 'warehouses':
        records = [...db.warehouses];
        break;
      case 'warehouse_bookings':
        records = [...db.warehouseBookings];
        break;
      case 'government_schemes':
        records = [...db.governmentSchemes];
        break;
      case 'scheme_applications':
        records = [...db.schemeApplications];
        break;
      case 'market_prices':
        records = [...db.marketPrices];
        break;
      case 'buyers':
        records = [...db.buyerListings];
        break;
      case 'crop_listings':
        records = [...db.cropListings];
        break;
      case 'audit_logs':
        records = [...db.auditLogs];
        break;
      default:
        return res.status(404).json({ error: `Table '${tableName}' not found` });
    }

    // Filter Demo Data if requested
    if (filterDemo === 'true') {
      records = records.filter((r) => r.is_demo !== true);
    }

    // Generic Search across text fields
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      records = records.filter((item) =>
        Object.values(item).some((val) => {
          if (typeof val === 'string') return val.toLowerCase().includes(q);
          if (typeof val === 'number') return val.toString().includes(q);
          if (Array.isArray(val)) return val.some((v) => typeof v === 'string' && v.toLowerCase().includes(q));
          return false;
        })
      );
    }

    // Generic Sort
    if (sortKey && typeof sortKey === 'string') {
      const dir = sortDir === 'desc' ? -1 : 1;
      records.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA === valB) return 0;
        if (valA > valB) return dir;
        return -dir;
      });
    }

    const total = records.length;
    const pageNum = parseInt((page as string) || '1', 10);
    const pageSize = parseInt((limit as string) || '15', 10);
    const startIdx = (pageNum - 1) * pageSize;
    const paginated = records.slice(startIdx, startIdx + pageSize);

    res.json({
      tableName,
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
      data: paginated,
    });
  });

  // Admin delete/soft delete record
  app.delete('/api/admin/tables/:tableName/:id', (req: Request, res: Response) => {
    const { tableName, id } = req.params;
    // Perform audit
    db.logAudit('usr_admin_1', 'admin.agrisaarthi@nic.in', 'admin', 'DELETE_RECORD', tableName, id);
    res.json({ success: true, message: `Record ${id} removed from ${tableName}` });
  });

  // ==========================================
  // 13. FARMER COMMUNITY & INTERACTIVE MAP API
  // ==========================================
  app.get('/api/community/peers', (req: Request, res: Response) => {
    const { lat, lng, radius, crop, method, collaboration, hasEquipment, search } = req.query;
    const userLat = lat ? parseFloat(lat as string) : 10.6586;
    const userLng = lng ? parseFloat(lng as string) : 77.0089;

    const peers = db.searchNearbyFarmerPeers({
      lat: userLat,
      lng: userLng,
      radiusKm: radius ? parseFloat(radius as string) : undefined,
      crop: crop as string,
      method: method as string,
      collaboration: collaboration as string,
      hasEquipment: hasEquipment === 'true',
      search: search as string,
    });

    res.json(peers);
  });

  app.get('/api/community/knowledge-nodes', (req: Request, res: Response) => {
    const { lat, lng, radius, category, crop, urgency, search } = req.query;
    const userLat = lat ? parseFloat(lat as string) : 10.6586;
    const userLng = lng ? parseFloat(lng as string) : 77.0089;

    const nodes = db.searchFarmingKnowledgeNodes({
      lat: userLat,
      lng: userLng,
      radiusKm: radius ? parseFloat(radius as string) : undefined,
      category: category as string,
      crop: crop as string,
      urgency: urgency as string,
      search: search as string,
    });

    res.json(nodes);
  });

  app.post('/api/community/knowledge-nodes', (req: Request, res: Response) => {
    const node = db.createFarmingKnowledgeNode(req.body);
    res.status(201).json(node);
  });

  app.post('/api/community/knowledge-nodes/:id/upvote', (req: Request, res: Response) => {
    const { farmerId } = req.body;
    const result = db.upvoteFarmingKnowledgeNode(req.params.id, farmerId || 'usr_farmer_1');
    res.json(result);
  });

  app.get('/api/community/opt-in', (req: Request, res: Response) => {
    const farmerId = (req.query.farmerId as string) || 'usr_farmer_1';
    const settings = db.getFarmerCommunityOptIn(farmerId);
    res.json(settings);
  });

  app.post('/api/community/opt-in', (req: Request, res: Response) => {
    const { farmerId, settings } = req.body;
    const updated = db.updateFarmerCommunityOptIn(farmerId || 'usr_farmer_1', settings || req.body);
    res.json(updated);
  });

  app.post('/api/community/messages', (req: Request, res: Response) => {
    const result = db.recordPeerMessage(req.body);
    res.json(result);
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgriSaarthi AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AgriSaarthi server:', err);
  process.exit(1);
});
