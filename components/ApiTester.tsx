'use client';

import { useState } from 'react';
import { testHealthCheck, testGetItems, testStartTracking, testGetMissingItems, testAllEndpoints } from '@/lib/api';

export default function ApiTester() {
    const [results, setResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const addResult = (message: string) => {
        setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const clearResults = () => {
        setResults([]);
    };

    const runHealthCheck = async () => {
        setIsLoading(true);
        addResult('🏥 Testing Health Check...');
        try {
            const success = await testHealthCheck();
            addResult(success ? '✅ Health Check: PASSED' : '❌ Health Check: FAILED');
        } catch (error) {
            addResult(`❌ Health Check Error: ${error}`);
        }
        setIsLoading(false);
    };

    const runGetItems = async () => {
        setIsLoading(true);
        addResult('📦 Testing Get Items (Map 18, Day 1)...');
        try {
            const success = await testGetItems(18, 1);
            addResult(success ? '✅ Get Items: PASSED' : '❌ Get Items: FAILED');
        } catch (error) {
            addResult(`❌ Get Items Error: ${error}`);
        }
        setIsLoading(false);
    };

    const runStartTracking = async () => {
        setIsLoading(true);
        addResult('🎯 Testing Start Tracking...');
        try {
            const success = await testStartTracking();
            addResult(success ? '✅ Start Tracking: PASSED' : '❌ Start Tracking: FAILED');
        } catch (error) {
            addResult(`❌ Start Tracking Error: ${error}`);
        }
        setIsLoading(false);
    };

    const runGetMissingItems = async () => {
        setIsLoading(true);
        addResult('🔍 Testing Get Missing Items...');
        try {
            const success = await testGetMissingItems('test-session');
            addResult(success ? '✅ Get Missing Items: PASSED' : '❌ Get Missing Items: FAILED');
        } catch (error) {
            addResult(`❌ Get Missing Items Error: ${error}`);
        }
        setIsLoading(false);
    };

    const runAllTests = async () => {
        setIsLoading(true);
        clearResults();
        addResult('🧪 Running comprehensive API tests...');
        try {
            await testAllEndpoints();
            addResult('🏁 All tests completed! Check console for detailed results.');
        } catch (error) {
            addResult(`❌ Test Suite Error: ${error}`);
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">🧪 API Connection Tester</h1>

            <div className="mb-6">
                <p className="text-gray-600 mb-2">
                    <strong>Backend API:</strong> https://wmc-wam.onrender.com
                </p>
                <p className="text-sm text-gray-500">
                    Open browser console (F12) to see detailed API responses and debugging information.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <button
                    onClick={runHealthCheck}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    🏥 Health Check
                </button>

                <button
                    onClick={runGetItems}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    📦 Get Items
                </button>

                <button
                    onClick={runStartTracking}
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    🎯 Start Tracking
                </button>

                <button
                    onClick={runGetMissingItems}
                    disabled={isLoading}
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    🔍 Missing Items
                </button>

                <button
                    onClick={runAllTests}
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    🧪 Run All Tests
                </button>

                <button
                    onClick={clearResults}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    🗑️ Clear Results
                </button>
            </div>

            {isLoading && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-600">Testing API endpoints...</p>
                </div>
            )}

            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-semibold">Test Results</h3>
                    <span className="text-gray-400 text-xs">{results.length} results</span>
                </div>
                {results.length === 0 ? (
                    <p className="text-gray-500">No tests run yet. Click a button above to start testing.</p>
                ) : (
                    results.map((result, index) => (
                        <div key={index} className="mb-1">
                            {result}
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">🔧 Available Console Commands</h3>
                <div className="text-sm text-blue-700 space-y-1">
                    <div><code>testHealthCheck()</code> - Test health endpoint</div>
                    <div><code>testGetItems(mapId, day)</code> - Test get items endpoint</div>
                    <div><code>testStartTracking()</code> - Test start tracking endpoint</div>
                    <div><code>testGetMissingItems(sessionId)</code> - Test missing items endpoint</div>
                    <div><code>testAllEndpoints()</code> - Run comprehensive test suite</div>
                    <div><code>API_BASE_URL</code> - Show current API base URL</div>
                </div>
            </div>
        </div>
    );
} 