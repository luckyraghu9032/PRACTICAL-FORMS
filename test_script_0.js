
                            function handleCollegeChange() {
                                const select = document.getElementById('master-college-select');
                                const otherWrapper = document.getElementById('master-college-other-wrapper');
                                const otherInput = document.getElementById('master-college-other');
                                const distanceInput = document.getElementById('master-distance');
                                
                                if (select.value === 'Others') {
                                    otherWrapper.style.display = 'block';
                                    distanceInput.readOnly = false;
                                    updateCollegeValue();
                                } else {
                                    otherWrapper.style.display = 'none';
                                    otherInput.value = '';
                                    updateCollegeValue();
                                }
                                
                                if (select.value === 'Sandip University') {
                                    distanceInput.value = 0;
                                    distanceInput.readOnly = true;
                                } else {
                                    if(distanceInput.value === '0') distanceInput.value = '';
                                    distanceInput.readOnly = false;
                                }
                            }
                            function updateCollegeValue() {
                                const select = document.getElementById('master-college-select');
                                const otherInput = document.getElementById('master-college-other');
                                const hidden = document.getElementById('master-college');
                                
                                if (select.value === 'Others') {
                                    hidden.value = otherInput.value;
                                } else {
                                    hidden.value = select.value;
                                }
                            }
                        