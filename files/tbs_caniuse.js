/**
*去除QB、Chrome以及TBS4.0以下项（3.5,3.6,3.7,3.8,3.9）
*/
function deleteChromeAndQBFeature(all_data, feature){
	var feature_length=all_data[feature].features.length;
	for(index = feature_length - 1; index >= 0; index--){
		delete all_data[feature].features[index].stats.Chrome;
		delete all_data[feature].features[index].stats.QB;
		var tbs_length=all_data[feature].features[index].stats.Tbs.length;
		for(tbs_index = tbs_length - 1; tbs_index >= 0; tbs_index--){
			var tbs_version = all_data[feature].features[index].stats.Tbs[tbs_index].version;
			if ( tbs_version == "Tbs|3.5"
				|| tbs_version == "Tbs|3.6"
				|| tbs_version == "Tbs|3.7"
				|| tbs_version == "Tbs|3.8"
				|| tbs_version == "Tbs|3.9"
			){
				delete all_data[feature].features[index].stats.Tbs.splice(tbs_index,1);
			}
		}
	}
}

/**
*将TBS中未测试项使用前一项的值代替
*/
function disposeTbsNoTestFeature(all_data, feature){
	var feature_length=all_data[feature].features.length;
	for(index = feature_length - 1; index >= 0; index--){
		var tbs_length=all_data[feature].features[index].stats.Tbs.length;
		for(tbs_index = 1; tbs_index < tbs_length; tbs_index++){
			var current_tbs_item = all_data[feature].features[index].stats.Tbs[tbs_index];
			var note = current_tbs_item.note.t;
			if(note == "Not Test") {
				current_tbs_item.note = 
					all_data[feature].features[index].stats.Tbs[tbs_index - 1].note;
				current_tbs_item.supported =
					all_data[feature].features[index].stats.Tbs[tbs_index - 1].supported;
			}
		}
	}
}

var not_support_note={t: "Not Supported", d: " "};
var support_note={t: "Supported", d: " "};
var partially_support_note={t: "Partially Supported", d: ""};

function changeTbsFeatureSupported(all_data_features, case_name, tbs_version, support_value){
	var target_note = support_value == "y" ? support_note : not_support_note;
	if(support_value == "p"){
		target_note = partially_support_note;
	}
	var feature_length=all_data_features.features.length;
	for(index = feature_length - 1; index >= 0; index--){
		var item_case_name = all_data_features.features[index].title.case_name;
		if(item_case_name == case_name) {
			var tbs_length=all_data_features.features[index].stats.Tbs.length;
			for(tbs_index = 0; tbs_index < tbs_length; tbs_index++){
				var item_tbs_version = all_data_features.features[index].stats.Tbs[tbs_index].version;
				if(item_tbs_version == tbs_version) {
					all_data_features.features[index].stats.Tbs[tbs_index].supported = support_value;
					all_data_features.features[index].stats.Tbs[tbs_index].note = target_note;
				}
			}
		}
	}
}

function addTbsFeatureFromVersions(all_data, features, versions){
	if (typeof(versions) != 'string' && versions.length == 2) {
		addTbsFeatureEqualsTo(all_data, features, versions[0], versions[1]);
	}
}

function addTbsFeatureEqualsTo(all_data, features, target_version, add_version){
	var all_data_features = all_data[features]
	var feature_length=all_data_features.features.length;
	for(index = feature_length - 1; index >= 0; index--){
		var tbs_length=all_data_features.features[index].stats.Tbs.length;
		for(tbs_index = 0; tbs_index < tbs_length; tbs_index++){
			var current_item = all_data_features.features[index].stats.Tbs[tbs_index];
			if(current_item.version == target_version) {
				var new_version_feature = {supported: "x", version: add_version, note:{t: "x",d: ""}};
				new_version_feature.supported = current_item.supported;
				new_version_feature.note = current_item.note;
				all_data_features.features[index].stats.Tbs.push(new_version_feature);
				break;
			}
		}
	}
}

function printDiff(all_data, features){
	var all_data_features = all_data[features]
	var feature_length=all_data_features.features.length;
	for(index = feature_length - 1; index >= 0; index--){
		var tbs_length=all_data_features.features[index].stats.Tbs.length;
		for(tbs_index = 0; tbs_index < tbs_length - 1; tbs_index++){
			var current_item = all_data_features.features[index].stats.Tbs[tbs_index];
			var next_item = all_data_features.features[index].stats.Tbs[tbs_index + 1];
			if(current_item.supported != next_item.supported) {
				console.log("features:" + features 
									+ ",title:" + all_data_features.features[index].title.case_name
									+ ", current_tbs:" + current_item.version + "(" + current_item.supported + ")"
									+ ", next_item:" + next_item.version + "(" + next_item.supported + ")"
										);
			}
		}
	}
}

function callFunctionForEach(fun, all_data, ...paras){
	fun(all_data, "html", paras);
	fun(all_data, "jsapi", paras);
	fun(all_data, "svg", paras);
	fun(all_data, "css", paras);
	fun(all_data, "others", paras);
}

function disposeAllFeature(all_data){
	//删除Chrome、QB对应的数据
	callFunctionForEach(deleteChromeAndQBFeature, all_data);
	
	//将未测试项与前一项的测试结果保持一致
	callFunctionForEach(disposeTbsNoTestFeature, all_data);

	//针对部分异常值进行转换
	changeTbsFeatureSupported(all_data.html, "Spellcheck attribute", "Tbs|4.8", "n");
	changeTbsFeatureSupported(all_data.html, "Spellcheck attribute", "Tbs|5.0", "n");
	changeTbsFeatureSupported(all_data.jsapi, "Clipboard API", "Tbs|5.0", "n");
	changeTbsFeatureSupported(all_data.jsapi, "FileReader API", "Tbs|4.9", "p");
	changeTbsFeatureSupported(all_data.jsapi, "getUserMediaStream API", "Tbs|5.1", "y");
	changeTbsFeatureSupported(all_data.svg, "SVG favicons", "Tbs|5.1", "n");
	changeTbsFeatureSupported(all_data.css, "placeholder-shown CSS pseudo-class", "Tbs|5.0", "n");
	changeTbsFeatureSupported(all_data.css, "font-face Web fonts", "Tbs|5.0", "y");
	changeTbsFeatureSupported(all_data.css, "2.1 selectors", "Tbs|5.0", "y");
	changeTbsFeatureSupported(all_data.css, "clip-path property", "Tbs|4.4", "y");
	changeTbsFeatureSupported(all_data.css, "Hyphenation", "Tbs|5.1", "n");
	changeTbsFeatureSupported(all_data.css, "inline-block", "Tbs|5.1", "y");
	changeTbsFeatureSupported(all_data.css, "touch-action property", "Tbs|5.1", "y");
	changeTbsFeatureSupported(all_data.css, "Box-sizing", "Tbs|4.9", "y");
	changeTbsFeatureSupported(all_data.css, "Box-sizing", "Tbs|5.0", "y");
	changeTbsFeatureSupported(all_data.others, "Upgrade Insecure Requests", "Tbs|4.9", "y");
	changeTbsFeatureSupported(all_data.others, "Upgrade Insecure Requests", "Tbs|5.0", "y");
	changeTbsFeatureSupported(all_data.others, "XHTML served as application", "Tbs|4.9", "y");
	changeTbsFeatureSupported(all_data.others, "XHTML served as application", "Tbs|5.0", "y");
	
	callFunctionForEach(addTbsFeatureFromVersions, all_data, "Tbs|5.1", "Tbs|5.2");
	
	callFunctionForEach(printDiff, all_data);
}